import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"
import { welcomeEmail, betaWelcomeEmail, paymentFailedEmail, subscriptionCancelledEmail } from "@/lib/email-templates"
import { logAudit } from "@/lib/audit-log"
import { sendToGhl } from "@/lib/ghl"
import type Stripe from "stripe"
import type { SupabaseClient } from "@supabase/supabase-js"

async function findAuthUserIdByEmail(
  supabase: SupabaseClient,
  email: string,
): Promise<string | null> {
  const target = email.toLowerCase()
  const PAGE_SIZE = 200
  const MAX_PAGES = 25
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    })
    if (error) {
      console.error("[Stripe Webhook] listUsers page error:", error)
      return null
    }
    const users = data?.users ?? []
    const hit = users.find((u) => u.email?.toLowerCase() === target)
    if (hit) return hit.id
    if (users.length < PAGE_SIZE) return null
  }
  console.warn(
    `[Stripe Webhook] findAuthUserIdByEmail: exceeded MAX_PAGES=${MAX_PAGES} without match`,
  )
  return null
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const REPLAY_MAX_AGE_SECONDS = 60 * 60
  const eventAgeSeconds = Math.floor(Date.now() / 1000) - event.created
  if (eventAgeSeconds > REPLAY_MAX_AGE_SECONDS) {
    console.warn(
      `[Stripe Webhook] Rejecting stale event ${event.id} (age=${eventAgeSeconds}s)`,
    )
    return NextResponse.json({ error: "Event too old" }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Log every webhook event for debugging
  console.log(`[Stripe Webhook] event=${event.type} id=${event.id}`)

  // Idempotency: skip if this event was already processed
  const { data: existingEvent } = await supabase
    .from("webhook_events")
    .select("event_id")
    .eq("event_id", event.id)
    .maybeSingle()

  if (existingEvent) {
    console.log(`[Stripe Webhook] Duplicate event ${event.id}, skipping`)
    return NextResponse.json({ received: true, duplicate: true })
  }

  const { error: insertError } = await supabase.from("webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
  })
  if (insertError) {
    if (insertError.code === "23505") {
      console.log(`[Stripe Webhook] Duplicate event ${event.id} (race), skipping`)
      return NextResponse.json({ received: true, duplicate: true })
    }
    console.error("[Webhook] Failed to record event:", insertError)
    return NextResponse.json({ error: "Failed to record webhook event" }, { status: 500 })
  }

  logAudit({ action: "stripe.webhook", resource_type: "stripe_event", resource_id: event.id, details: { event_type: event.type } })

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const isBeta = session.metadata?.plan_type === "beta_subscription"

        if (!session.customer) {
          console.error("checkout.session.completed: missing customer", {
            customer: session.customer,
          })
          break
        }

        const customerId = session.customer as string

        if (isBeta) {
          // ─── BETA SUBSCRIPTION ($297/mo locked-in rate) ───
          console.log(`[Stripe Webhook] Beta subscription checkout completed: customer=[redacted:${customerId.slice(-4)}]`)

          const subscriptionId = typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription as Stripe.Subscription)?.id || null

          // Retrieve full session with customer expanded for email
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ["customer"],
          })
          const customer = fullSession.customer as Stripe.Customer
          const customerEmail = (
            customer?.email || fullSession.customer_details?.email || ""
          ).toLowerCase()

          // Reservation flow (post-2026-05-05): the checkout-beta route inserted
          // a placeholder beta_purchases row keyed by reservation_token. Find
          // and finalize that row instead of inserting a duplicate.
          const reservationToken =
            typeof session.metadata?.reservation_token === "string"
              ? session.metadata.reservation_token
              : null

          let finalized = false
          if (reservationToken) {
            const { error: updErr } = await supabase
              .from("beta_purchases")
              .update({
                email: customerEmail,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
              })
              .eq("reservation_token", reservationToken)
              .eq("claimed", false)
            if (!updErr) finalized = true
          }

          // Legacy / no-token fallback: insert a fresh row.
          if (!finalized) {
            await supabase.from("beta_purchases").insert({
              email: customerEmail,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
            })
          }

          // Try to find existing profile by stripe_customer_id
          let betaProfile: { id: string } | null = null
          const { data: profileByCustomer } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle()
          betaProfile = profileByCustomer

          // If not found, try to find by email via auth.users
          if (!betaProfile && customerEmail) {
            try {
              const matchedUserId = await findAuthUserIdByEmail(supabase, customerEmail)
              if (matchedUserId) {
                const { data: profileByUser } = await supabase
                  .from("profiles")
                  .select("id")
                  .eq("id", matchedUserId)
                  .maybeSingle()
                betaProfile = profileByUser
              }
            } catch (lookupErr) {
              console.error("[Stripe Webhook] Beta email lookup failed:", lookupErr)
            }
          }

          if (betaProfile) {
            // Link profile to beta subscription
            await supabase
              .from("profiles")
              .update({
                subscription_status: "active",
                is_beta_subscriber: true,
                beta_enrolled_at: new Date().toISOString(),
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
              })
              .eq("id", betaProfile.id)

            // Mark beta_purchases record as claimed. Prefer the
            // reservation_token path (post-2026-05-05 atomic-reserve flow)
            // when present so we touch exactly one row. Fall back to
            // (email, stripe_customer_id) tuple to avoid the bug-#24 case
            // where two rows can share an email after a refund + repurchase.
            if (reservationToken) {
              await supabase
                .from("beta_purchases")
                .update({ claimed: true, claimed_by: betaProfile.id })
                .eq("reservation_token", reservationToken)
            } else {
              await supabase
                .from("beta_purchases")
                .update({ claimed: true, claimed_by: betaProfile.id })
                .eq("email", customerEmail)
                .eq("stripe_customer_id", customerId)
                .eq("claimed", false)
            }

            await supabase.from("notifications").insert({
              profile_id: betaProfile.id,
              title: "Beta Access Activated",
              body: "Your beta subscription to RegenCompliance is now active at the locked-in rate of $297/mo. Welcome aboard!",
              type: "billing",
              action_url: "/dashboard/scanner",
            })

            // Send beta welcome email + GHL pipeline event (tier=beta).
            // Dedup is handled at the GHL workflow level via
            // stripe_customer_id - the callback claim path also fires this
            // event when activation happens later (e.g. customer paid before
            // creating their account).
            if (customerEmail) {
              const { data: betaFullProfile } = await supabase
                .from("profiles")
                .select("clinic_name")
                .eq("id", betaProfile.id)
                .maybeSingle()
              const template = betaWelcomeEmail(betaFullProfile?.clinic_name || "there")
              await sendEmail(customerEmail, template.subject, template.html)

              void sendToGhl("subscription_active", {
                email: customerEmail,
                company: betaFullProfile?.clinic_name ?? null,
                tier: "beta",
                monthly_price_cents: 29700,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
              })
            }
          } else {
            console.log(
              `[Stripe Webhook] Beta subscription purchase recorded for email=[redacted] - will be claimed on signup/login`
            )
          }
        } else {
          // ─── STANDARD SUBSCRIPTION ───
          if (!session.subscription) {
            console.error("checkout.session.completed: missing subscription for non-beta checkout", {
              customer: session.customer,
              subscription: session.subscription,
            })
            break
          }

          const subscriptionId = session.subscription as string

          console.log(`[Stripe Webhook] checkout.session.completed: customer=[redacted:${customerId.slice(-4)}] subscription=${subscriptionId}`)

          // Try to find profile by stripe_customer_id
          let { data: checkoutProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle()

          // If no profile found, try to link by email
          if (!checkoutProfile) {
            console.log(`[Stripe Webhook] No profile found by stripe_customer_id [redacted:${customerId.slice(-4)}], trying email lookup...`)

            try {
              const stripeCustomer = await stripe.customers.retrieve(customerId)
              if (!stripeCustomer.deleted && stripeCustomer.email) {
                const email = stripeCustomer.email

                const authUserId = await findAuthUserIdByEmail(supabase, email)

                if (authUserId) {
                  console.log(`[Stripe Webhook] Found auth user [redacted:${authUserId.slice(-4)}] by email=[redacted], linking stripe_customer_id`)

                  await supabase
                    .from("profiles")
                    .update({ stripe_customer_id: customerId })
                    .eq("id", authUserId)

                  const { data: linkedProfile } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("id", authUserId)
                    .maybeSingle()

                  checkoutProfile = linkedProfile
                } else {
                  console.error(`[Stripe Webhook] No auth user found for email=[redacted]`)
                }
              }
            } catch (lookupErr) {
              console.error("[Stripe Webhook] Email lookup failed:", lookupErr)
            }
          }

          if (!checkoutProfile) {
            console.error(`[Stripe Webhook] checkout.session.completed: no profile found for customer=[redacted:${customerId.slice(-4)}]`)
            break
          }

          await supabase
            .from("profiles")
            .update({
              subscription_status: "active",
              stripe_subscription_id: subscriptionId,
              // Reactivation - clear the cancelled-at clock so the
              // purge-cancelled cron doesn't sweep this user up.
              cancelled_at: null,
            })
            .eq("id", checkoutProfile.id)

          await supabase.from("notifications").insert({
            profile_id: checkoutProfile.id,
            title: "Subscription Active",
            body: "Your RegenCompliance subscription is now active. Start scanning your marketing content!",
            type: "billing",
            action_url: "/dashboard/scanner",
          })

          // Send welcome email + GHL pipeline event
          try {
            const stripeCustomerObj = await stripe.customers.retrieve(customerId)
            if (!stripeCustomerObj.deleted && stripeCustomerObj.email) {
              const { data: subProfile } = await supabase
                .from("profiles")
                .select("clinic_name")
                .eq("id", checkoutProfile.id)
                .maybeSingle()
              const template = welcomeEmail(subProfile?.clinic_name || "there")
              await sendEmail(stripeCustomerObj.email, template.subject, template.html)

              void sendToGhl("subscription_active", {
                email: stripeCustomerObj.email,
                company: subProfile?.clinic_name ?? null,
                tier: "standard",
                monthly_price_cents: 49700,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
              })
            }
          } catch (emailErr) {
            console.error("[Stripe Webhook] Welcome email failed (non-blocking):", emailErr)
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        if (!subscription.customer) {
          console.error("[Stripe Webhook] customer.subscription.updated: missing customer")
          break
        }

        const customerId = subscription.customer as string
        console.log(`[Stripe Webhook] customer.subscription.updated: customer=[redacted:${customerId.slice(-4)}] status=${subscription.status}`)

        const { data: updatedProfile } = await supabase
          .from("profiles")
          .select("id, is_beta_subscriber")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (!updatedProfile) {
          console.error(`[Stripe Webhook] customer.subscription.updated: no profile for customer=[redacted:${customerId.slice(-4)}]`)
          break
        }

        const status = subscription.status === "active" ? "active"
          : subscription.status === "past_due" ? "past_due"
          : subscription.status === "canceled" ? "cancelled"
          : null

        if (!status) {
          console.log(`[Stripe Webhook] Ignoring unmapped subscription status: ${subscription.status}`)
          break
        }

        if (updatedProfile.is_beta_subscriber && status !== "active") {
          console.log(`[Stripe Webhook] Beta subscriber - skipping demotion to ${status}`)
          break
        }

        await supabase
          .from("profiles")
          .update({ subscription_status: status })
          .eq("stripe_customer_id", customerId)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        if (!subscription.customer) {
          console.error("[Stripe Webhook] customer.subscription.deleted: missing customer")
          break
        }

        const customerId = subscription.customer as string
        console.log(`[Stripe Webhook] customer.subscription.deleted: customer=[redacted:${customerId.slice(-4)}]`)

        const { data: deletedProfile } = await supabase
          .from("profiles")
          .select("id, is_beta_subscriber")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (!deletedProfile) {
          console.error(`[Stripe Webhook] customer.subscription.deleted: no profile for customer=[redacted:${customerId.slice(-4)}]`)
          break
        }

        if (deletedProfile.is_beta_subscriber) {
          console.log(`[Stripe Webhook] Beta subscriber - keeping seat after Stripe cancellation`)
          break
        }

        // Stamp cancelled_at explicitly. The purge-cancelled cron reads this
        // column for the 30-day grace cutoff (migration 029) - using
        // profiles.updated_at would let unrelated admin tweaks reset the clock.
        await supabase
          .from("profiles")
          .update({
            subscription_status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId)

        await supabase.from("notifications").insert({
          profile_id: deletedProfile.id,
          title: "Subscription Cancelled",
          body: "Your subscription has been cancelled. You can resubscribe anytime from your account page.",
          type: "billing",
          action_url: "/dashboard/account",
        })

        // Send cancellation email + GHL pipeline event
        try {
          const cancelCustomerObj = await stripe.customers.retrieve(customerId)
          if (!cancelCustomerObj.deleted && cancelCustomerObj.email) {
            const { data: cancelProfile } = await supabase
              .from("profiles")
              .select("clinic_name")
              .eq("id", deletedProfile.id)
              .maybeSingle()
            const template = subscriptionCancelledEmail(cancelProfile?.clinic_name || "there")
            await sendEmail(cancelCustomerObj.email, template.subject, template.html)

            void sendToGhl("subscription_cancelled", {
              email: cancelCustomerObj.email,
              company: cancelProfile?.clinic_name ?? null,
              stripe_customer_id: customerId,
            })
          }
        } catch (emailErr) {
          console.error("[Stripe Webhook] Cancellation email failed (non-blocking):", emailErr)
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice

        if (!invoice.customer) {
          console.error("[Stripe Webhook] invoice.payment_failed: missing customer")
          break
        }

        const customerId = invoice.customer as string
        console.log(`[Stripe Webhook] invoice.payment_failed: customer=[redacted:${customerId.slice(-4)}]`)

        const { data: failedProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (!failedProfile) {
          console.error(`[Stripe Webhook] invoice.payment_failed: no profile for customer=[redacted:${customerId.slice(-4)}]`)
          break
        }

        await supabase
          .from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("stripe_customer_id", customerId)

        await supabase.from("notifications").insert({
          profile_id: failedProfile.id,
          title: "Payment Failed",
          body: "Your latest payment failed. Please update your payment method to keep your subscription active.",
          type: "billing",
          action_url: "/dashboard/account",
        })

        // Send payment failed email + GHL recovery sequence trigger
        try {
          const failedCustomerObj = await stripe.customers.retrieve(customerId)
          if (!failedCustomerObj.deleted && failedCustomerObj.email) {
            const { data: failedFullProfile } = await supabase
              .from("profiles")
              .select("clinic_name")
              .eq("id", failedProfile.id)
              .maybeSingle()
            const template = paymentFailedEmail(failedFullProfile?.clinic_name || "there")
            await sendEmail(failedCustomerObj.email, template.subject, template.html)

            void sendToGhl("payment_failed", {
              email: failedCustomerObj.email,
              company: failedFullProfile?.clinic_name ?? null,
              stripe_customer_id: customerId,
              amount_due_cents: invoice.amount_due ?? null,
            })
          }
        } catch (emailErr) {
          console.error("[Stripe Webhook] Payment failed email failed (non-blocking):", emailErr)
        }
        break
      }
    }
  } catch (error) {
    console.error("[Stripe Webhook] Handler error:", error)
    await supabase.from("webhook_events").delete().eq("event_id", event.id)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
