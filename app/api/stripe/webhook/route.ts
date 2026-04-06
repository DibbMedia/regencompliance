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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        await supabase
          .from("profiles")
          .update({
            subscription_status: "active",
            stripe_subscription_id: subscriptionId,
          })
          .eq("stripe_customer_id", customerId)

        // Get profile for notification
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (profile) {
          await supabase.from("notifications").insert({
            profile_id: profile.id,
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
        const customerId = subscription.customer as string
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
        const customerId = subscription.customer as string

        await supabase
          .from("profiles")
          .update({ subscription_status: "cancelled" })
          .eq("stripe_customer_id", customerId)

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (profile) {
          await supabase.from("notifications").insert({
            profile_id: profile.id,
            title: "Subscription Cancelled",
            body: "Your subscription has been cancelled. You can resubscribe anytime from your account page.",
            type: "billing",
            action_url: "/dashboard/account",
          })
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await supabase
          .from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("stripe_customer_id", customerId)

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (profile) {
          await supabase.from("notifications").insert({
            profile_id: profile.id,
            title: "Payment Failed",
            body: "Your latest payment failed. Please update your payment method to keep your subscription active.",
            type: "billing",
            action_url: "/dashboard/account",
          })
        }
        break
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
