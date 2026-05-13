import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/server"
import { sendToGhl } from "@/lib/ghl"
import { getProfile } from "@/lib/repos/profiles"
import { createNotification } from "@/lib/repos/notifications"
import { createAuditLogEntry } from "@/lib/repos/audit-log"
import {
  createBetaPurchaseReservation,
  finalizeBetaPurchaseByToken,
} from "@/lib/repos/beta-purchases"
import type Stripe from "stripe"
import type { SupabaseClient } from "@supabase/supabase-js"
import { randomUUID } from "node:crypto"

async function findAuthUserIdByEmail(
  supabase: SupabaseClient,
  email: string,
): Promise<string | null> {
  // Indexed RPC from migration 030. Replaces the listUsers paginator that
  // silently failed past 5000 users (200 perPage * 25 pages). The function
  // is SECURITY DEFINER, restricted to service-role callers only.
  const { data, error } = await supabase.rpc("find_auth_user_id_by_email", {
    p_email: email,
  })
  if (error) {
    console.error("[Stripe Webhook] find_auth_user_id_by_email rpc error:", error)
    return null
  }
  if (typeof data === "string" && data.length > 0) return data
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

  // Replay protection. Stripe queues events up to 24h on outage, so a
  // 60-min cap silently drops legit subscription events during a Stripe
  // delivery backlog. 24h matches Stripe's max retention; idempotency
  // via webhook_events covers actual replay attacks.
  const REPLAY_MAX_AGE_SECONDS = 24 * 60 * 60
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

  // System-keyed audit row (user_id NULL pre-profile-resolution). Per plan
  // §12.4 the encryption-aware repo dispatches to the v1s. system envelope
  // when user_id is null. Fire-and-forget to preserve the prior contract.
  void createAuditLogEntry(supabase, {
    user_id: null,
    action: "stripe.webhook",
    resource_type: "webhook_event",
    resource_id: event.id,
    status: "success",
    details: { event_type: event.type },
  }).catch((err) => {
    console.error("[Stripe Webhook] audit insert failed (non-blocking):", err)
  })

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
          // and finalize that row instead of inserting a duplicate. Email gets
          // encrypted under the row's per-row DEK via the repo helper.
          const reservationToken =
            typeof session.metadata?.reservation_token === "string"
              ? session.metadata.reservation_token
              : null

          let finalized = false
          if (reservationToken) {
            try {
              await finalizeBetaPurchaseByToken(supabase, reservationToken, {
                email: customerEmail,
                stripe_customer_id: customerId,
              })
              finalized = true
            } catch (finalizeErr) {
              console.error(
                "[Stripe Webhook] finalizeBetaPurchaseByToken failed:",
                finalizeErr,
              )
            }
          }

          // Legacy / no-token fallback: insert a fresh reservation row via
          // the repo so email_enc is encrypted properly. No reserve_beta_seat
          // path; we synthesize a token. stripe_subscription_id is NOT
          // persisted here - the column lives on `profiles`.
          if (!finalized) {
            try {
              await createBetaPurchaseReservation(supabase, {
                email: customerEmail,
                stripe_customer_id: customerId,
                reservation_token: randomUUID(),
              })
            } catch (insertErr) {
              console.error(
                "[Stripe Webhook] Fallback beta_purchases insert failed:",
                insertErr,
              )
            }
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
            // when present. Legacy fallback now only keys off
            // stripe_customer_id (UNIQUE since mig 009) - the `.eq("email")`
            // filter is dead post-Phase-6 because the plaintext email
            // column is gone after mig 042.
            if (reservationToken) {
              await supabase
                .from("beta_purchases")
                .update({ claimed: true, claimed_by: betaProfile.id })
                .eq("reservation_token", reservationToken)
            } else {
              await supabase
                .from("beta_purchases")
                .update({ claimed: true, claimed_by: betaProfile.id })
                .eq("stripe_customer_id", customerId)
                .eq("claimed", false)
            }

            await createNotification(supabase, betaProfile.id, {
              title: "Beta Access Activated",
              body: "Your beta subscription to RegenCompliance is now active at the locked-in rate of $297/mo. Welcome aboard!",
              type: "billing",
              action_url: "/dashboard/scanner",
            })

            // GHL fires the founder-beta welcome email (Resend path is
            // deprecated). Dedup at the GHL workflow level via
            // stripe_customer_id - the /auth/callback claim path also
            // fires this event when activation happens later (e.g.
            // customer paid before creating their account).
            if (customerEmail) {
              const betaFullProfile = await getProfile(supabase, betaProfile.id)

              void sendToGhl("subscription_active", {
                email: customerEmail,
                company: betaFullProfile?.clinic_name ?? null,
                tier: "beta",
                monthly_price_cents: 29700,
                subscription_status: "active",
                subscription_started_at: new Date().toISOString(),
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

          await createNotification(supabase, checkoutProfile.id, {
            title: "Subscription Active",
            body: "Your RegenCompliance subscription is now active. Start scanning your marketing content!",
            type: "billing",
            action_url: "/dashboard/scanner",
          })

          // GHL fires the welcome email (Resend path is deprecated;
          // operator runs all transactional email through GHL workflows).
          try {
            const stripeCustomerObj = await stripe.customers.retrieve(customerId)
            if (!stripeCustomerObj.deleted && stripeCustomerObj.email) {
              const subProfile = await getProfile(supabase, checkoutProfile.id)

              void sendToGhl("subscription_active", {
                email: stripeCustomerObj.email,
                company: subProfile?.clinic_name ?? null,
                tier: "standard",
                monthly_price_cents: 49700,
                subscription_status: "active",
                subscription_started_at: new Date().toISOString(),
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
              })
            }
          } catch (emailErr) {
            console.error("[Stripe Webhook] Customer fetch failed (non-blocking):", emailErr)
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

        await createNotification(supabase, deletedProfile.id, {
          title: "Subscription Cancelled",
          body: "Your subscription has been cancelled. You can resubscribe anytime from your account page.",
          type: "billing",
          action_url: "/dashboard/account",
        })

        // GHL fires the cancellation email (Resend path is deprecated).
        try {
          const cancelCustomerObj = await stripe.customers.retrieve(customerId)
          if (!cancelCustomerObj.deleted && cancelCustomerObj.email) {
            const cancelProfile = await getProfile(supabase, deletedProfile.id)

            void sendToGhl("subscription_cancelled", {
              email: cancelCustomerObj.email,
              company: cancelProfile?.clinic_name ?? null,
              stripe_customer_id: customerId,
              subscription_status: "cancelled",
              cancelled_at: new Date().toISOString(),
            })
          }
        } catch (emailErr) {
          console.error("[Stripe Webhook] Customer fetch failed (non-blocking):", emailErr)
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

        await createNotification(supabase, failedProfile.id, {
          title: "Payment Failed",
          body: "Your latest payment failed. Please update your payment method to keep your subscription active.",
          type: "billing",
          action_url: "/dashboard/account",
        })

        // GHL fires the recovery sequence (Resend path is deprecated; the
        // operator runs all transactional email through GHL workflows).
        try {
          const failedCustomerObj = await stripe.customers.retrieve(customerId)
          if (!failedCustomerObj.deleted && failedCustomerObj.email) {
            const failedFullProfile = await getProfile(supabase, failedProfile.id)

            void sendToGhl("payment_failed", {
              email: failedCustomerObj.email,
              company: failedFullProfile?.clinic_name ?? null,
              stripe_customer_id: customerId,
              subscription_status: "past_due",
              amount_due_cents: invoice.amount_due ?? null,
            })
          }
        } catch (emailErr) {
          console.error("[Stripe Webhook] Payment failed customer fetch failed (non-blocking):", emailErr)
        }
        break
      }

      case "invoice.paid": {
        // Fires for the initial subscription invoice AND every recurring
        // renewal. GHL workflow handles the receipt email using the
        // hosted invoice URL + PDF link from the payload.
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.customer) {
          console.error("[Stripe Webhook] invoice.paid: missing customer")
          break
        }
        const customerId = invoice.customer as string
        console.log(
          `[Stripe Webhook] invoice.paid: customer=[redacted:${customerId.slice(-4)}] amount=${invoice.amount_paid}`,
        )

        // clinic_name is encrypted post-migration 034 - go through the repo.
        // The compound select on profiles drops clinic_name from the row
        // shape; we still need it for GHL.
        const { data: paidProfile } = await supabase
          .from("profiles")
          .select("id, subscription_status")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (!paidProfile) {
          // Customer paid but profile not yet linked - claimBetaPurchase or
          // a subsequent webhook fires shortly. GHL still gets the receipt
          // event below if we can resolve the email via Stripe.
          console.log(
            `[Stripe Webhook] invoice.paid: no profile yet for customer=[redacted:${customerId.slice(-4)}], pushing GHL anyway`,
          )
        } else {
          // Successful payment implies active subscription - clear any
          // past_due / cancelled flags.
          await supabase
            .from("profiles")
            .update({ subscription_status: "active", cancelled_at: null })
            .eq("id", paidProfile.id)
        }

        try {
          const paidCustomerObj = await stripe.customers.retrieve(customerId)
          if (paidCustomerObj.deleted || !paidCustomerObj.email) break

          const paidFullProfile = paidProfile
            ? await getProfile(supabase, paidProfile.id)
            : null

          void sendToGhl("invoice_paid", {
            email: paidCustomerObj.email,
            company: paidFullProfile?.clinic_name ?? null,
            stripe_customer_id: customerId,
            subscription_status: "active",
            invoice_id: invoice.id,
            invoice_number: invoice.number ?? null,
            invoice_amount_cents: invoice.amount_paid ?? 0,
            invoice_currency: (invoice.currency ?? "usd").toLowerCase(),
            invoice_url: invoice.hosted_invoice_url ?? null,
            invoice_pdf_url: invoice.invoice_pdf ?? null,
            invoice_period_start: invoice.period_start
              ? new Date(invoice.period_start * 1000).toISOString()
              : null,
            invoice_period_end: invoice.period_end
              ? new Date(invoice.period_end * 1000).toISOString()
              : null,
            invoice_paid_at: new Date().toISOString(),
          })
        } catch (err) {
          console.error("[Stripe Webhook] invoice.paid customer fetch failed (non-blocking):", err)
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
