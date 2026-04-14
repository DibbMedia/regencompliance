import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"
import { welcomeEmail, betaWelcomeEmail, paymentFailedEmail, subscriptionCancelledEmail } from "@/lib/email-templates"
import { logAudit } from "@/lib/audit-log"
import type Stripe from "stripe"

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

  // Record event as processed BEFORE handling to prevent race conditions
  const { error: insertError } = await supabase.from("webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
  })
  if (insertError) {
    console.error("[Webhook] Failed to record event:", insertError)
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

          // Record the beta purchase
          await supabase.from("beta_purchases").insert({
            email: customerEmail,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          })

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
              const { data: authData } = await supabase.auth.admin.listUsers()
              const matchedUser = authData?.users?.find(
                (u) => u.email?.toLowerCase() === customerEmail
              )
              if (matchedUser) {
                const { data: profileByUser } = await supabase
                  .from("profiles")
                  .select("id")
                  .eq("id", matchedUser.id)
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

            // Mark beta_purchases record as claimed
            await supabase
              .from("beta_purchases")
              .update({ claimed: true, claimed_by: betaProfile.id })
              .eq("email", customerEmail)
              .eq("claimed", false)

            await supabase.from("notifications").insert({
              profile_id: betaProfile.id,
              title: "Beta Access Activated",
              body: "Your beta subscription to RegenCompliance is now active at the locked-in rate of $297/mo. Welcome aboard!",
              type: "billing",
              action_url: "/dashboard/scanner",
            })

            // Send beta welcome email
            if (customerEmail) {
              const { data: betaFullProfile } = await supabase
                .from("profiles")
                .select("clinic_name")
                .eq("id", betaProfile.id)
                .maybeSingle()
              const template = betaWelcomeEmail(betaFullProfile?.clinic_name || "there")
              await sendEmail(customerEmail, template.subject, template.html)
            }
          } else {
            console.log(
              `[Stripe Webhook] Beta subscription purchase recorded for email=[redacted] — will be claimed on signup/login`
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

                const { data: authData } = await supabase.auth.admin.listUsers()
                const authUser = authData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

                if (authUser) {
                  console.log(`[Stripe Webhook] Found auth user [redacted:${authUser.id.slice(-4)}] by email=[redacted], linking stripe_customer_id`)

                  await supabase
                    .from("profiles")
                    .update({ stripe_customer_id: customerId })
                    .eq("id", authUser.id)

                  const { data: linkedProfile } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("id", authUser.id)
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
            })
            .eq("id", checkoutProfile.id)

          await supabase.from("notifications").insert({
            profile_id: checkoutProfile.id,
            title: "Subscription Active",
            body: "Your RegenCompliance subscription is now active. Start scanning your marketing content!",
            type: "billing",
            action_url: "/dashboard/scanner",
          })

          // Send welcome email
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
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (!updatedProfile) {
          console.error(`[Stripe Webhook] customer.subscription.updated: no profile for customer=[redacted:${customerId.slice(-4)}]`)
          break
        }

        const status = subscription.status === "active" ? "active"
          : subscription.status === "past_due" ? "past_due"
          : subscription.status === "canceled" ? "cancelled"
          : subscription.status

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
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (!deletedProfile) {
          console.error(`[Stripe Webhook] customer.subscription.deleted: no profile for customer=[redacted:${customerId.slice(-4)}]`)
          break
        }

        await supabase
          .from("profiles")
          .update({ subscription_status: "cancelled" })
          .eq("stripe_customer_id", customerId)

        await supabase.from("notifications").insert({
          profile_id: deletedProfile.id,
          title: "Subscription Cancelled",
          body: "Your subscription has been cancelled. You can resubscribe anytime from your account page.",
          type: "billing",
          action_url: "/dashboard/account",
        })

        // Send cancellation email
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

        // Send payment failed email
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
          }
        } catch (emailErr) {
          console.error("[Stripe Webhook] Payment failed email failed (non-blocking):", emailErr)
        }
        break
      }
    }
  } catch (error) {
    console.error("[Stripe Webhook] Handler error:", error)
    // Return 200 so Stripe doesn't retry — the event was received but unprocessable
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 200 })
  }

  return NextResponse.json({ received: true })
}
