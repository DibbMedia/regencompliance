import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/server"
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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const isBeta = session.metadata?.plan_type === "beta_lifetime"

        if (!session.customer) {
          console.error("checkout.session.completed: missing customer", {
            customer: session.customer,
          })
          break
        }

        const customerId = session.customer as string

        if (isBeta) {
          // ─── BETA ONE-TIME PAYMENT ───
          console.log(`[Stripe Webhook] Beta checkout completed: customer=${customerId}`)

          // Retrieve full session with customer expanded for email
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ["customer"],
          })
          const customer = fullSession.customer as Stripe.Customer
          const customerEmail = (
            customer?.email || fullSession.customer_details?.email || ""
          ).toLowerCase()
          const paymentIntentId =
            typeof fullSession.payment_intent === "string"
              ? fullSession.payment_intent
              : fullSession.payment_intent?.id || null

          // Record the beta purchase
          await supabase.from("beta_purchases").insert({
            email: customerEmail,
            stripe_customer_id: customerId,
            stripe_payment_intent_id: paymentIntentId,
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
            // Link profile to beta
            await supabase
              .from("profiles")
              .update({
                subscription_status: "active",
                is_beta_subscriber: true,
                beta_enrolled_at: new Date().toISOString(),
                stripe_customer_id: customerId,
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
              body: "Your lifetime beta access to RegenCompliance is now active. Welcome aboard!",
              type: "billing",
              action_url: "/dashboard/scanner",
            })
          } else {
            console.log(
              `[Stripe Webhook] Beta purchase recorded for ${customerEmail} — will be claimed on signup/login`
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

          console.log(`[Stripe Webhook] checkout.session.completed: customer=${customerId} subscription=${subscriptionId}`)

          // Try to find profile by stripe_customer_id
          let { data: checkoutProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle()

          // If no profile found, try to link by email
          if (!checkoutProfile) {
            console.log(`[Stripe Webhook] No profile found by stripe_customer_id ${customerId}, trying email lookup...`)

            try {
              const stripeCustomer = await stripe.customers.retrieve(customerId)
              if (!stripeCustomer.deleted && stripeCustomer.email) {
                const email = stripeCustomer.email

                const { data: authData } = await supabase.auth.admin.listUsers()
                const authUser = authData?.users?.find((u) => u.email === email)

                if (authUser) {
                  console.log(`[Stripe Webhook] Found auth user ${authUser.id} by email ${email}, linking stripe_customer_id`)

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
                  console.error(`[Stripe Webhook] No auth user found for email ${email}`)
                }
              }
            } catch (lookupErr) {
              console.error("[Stripe Webhook] Email lookup failed:", lookupErr)
            }
          }

          if (!checkoutProfile) {
            console.error(`[Stripe Webhook] checkout.session.completed: no profile found for customer ${customerId}`)
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
        console.log(`[Stripe Webhook] customer.subscription.updated: customer=${customerId} status=${subscription.status}`)

        const { data: updatedProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (!updatedProfile) {
          console.error(`[Stripe Webhook] customer.subscription.updated: no profile for customer ${customerId}`)
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
        console.log(`[Stripe Webhook] customer.subscription.deleted: customer=${customerId}`)

        const { data: deletedProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (!deletedProfile) {
          console.error(`[Stripe Webhook] customer.subscription.deleted: no profile for customer ${customerId}`)
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
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice

        if (!invoice.customer) {
          console.error("[Stripe Webhook] invoice.payment_failed: missing customer")
          break
        }

        const customerId = invoice.customer as string
        console.log(`[Stripe Webhook] invoice.payment_failed: customer=${customerId}`)

        const { data: failedProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (!failedProfile) {
          console.error(`[Stripe Webhook] invoice.payment_failed: no profile for customer ${customerId}`)
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
