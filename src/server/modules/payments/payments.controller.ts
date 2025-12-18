import { Hono } from "hono"
import { describeRoute, validator as zValidator } from "hono-openapi"
import { z } from "zod"
import { privateEnv } from "@/env.private"
import { publicEnv } from "@/env.public"
import { dodoClient } from "@/server/lib/payments-client"
import { authMiddleware, requireAuthMiddleware } from "../auth/auth.middleware"

export const paymentsController = new Hono()
  .use(describeRoute({ tags: ["Payments"] }))
  // Checkout
  .get(
    "/checkout/:variantId",
    describeRoute({}),
    authMiddleware,
    requireAuthMiddleware,
    zValidator(
      "param",
      z.object({
        variantId: z.string(),
      })
    ),
    async (c) => {
      const referer = c.req.header("referer") || publicEnv.PUBLIC_BASE_URL

      const user = c.var.user

      try {
        const validParam = c.req.valid("param")
        console.log("[/checkout/:variantId] variantId:", validParam.variantId)

        const session = await dodoClient.createCheckoutSession({
          productId: validParam.variantId,
          metadata: {
            userId: user.id,
          },
        })

        const url = session.checkout_url

        if (!url) {
          return c.redirect(
            `${referer}?error=We could not create a valid checkout link. Please try again.`
          )
        }

        return c.redirect(url)
      } catch (error) {
        console.error("Error creating checkout:", error)
        return c.redirect(
          `${referer}?error=Something went wrong while setting up your payment. Please try again.`
        )
      }
    }
  )

  // Webhook handler
  .post("/webhook", describeRoute({}), async (c) => {
    console.log("💌 Webhook received")
    try {
      const body = await c.req.text()
      const headers = {
        "webhook-id": c.req.header("webhook-id") || "",
        "webhook-signature": c.req.header("webhook-signature") || "",
        "webhook-timestamp": c.req.header("webhook-timestamp") || "",
      }

      const webhookSecret = privateEnv.DODO_PAYMENTS_WEBOOK_SECRET || ""

      // Using standardwebhooks library for verification
      const { Webhook } = require("standardwebhooks")
      const webhook = new Webhook(webhookSecret)

      // Verify the webhook signature
      await webhook.verify(body, headers)

      // Parse the body after verification
      const payload = JSON.parse(body)
      console.log("Webhook payload:", payload)

      // Handle different event types
      switch (payload.type) {
        case "payment.succeeded":
          console.log("Payment succeeded:", payload.data)
          // TODO: Handle successful payment (e.g., activate license, send email)
          break
        case "payment.failed":
          console.log("Payment failed:", payload.data)
          // TODO: Handle failed payment (e.g., notify user)
          break
        case "subscription.created":
          console.log("Subscription created:", payload.data)
          // TODO: Handle new subscription
          break
        case "subscription.cancelled":
          console.log("Subscription cancelled:", payload.data)
          // TODO: Handle cancelled subscription
          break
        default:
          console.log("Unhandled event type:", payload.type)
      }

      // Return 200 to acknowledge receipt
      return c.text("OK", 200)
    } catch (error) {
      console.error("Webhook verification or processing failed:", error)
      // Return 400 for invalid webhooks (will trigger retry logic)
      return c.text("Bad Request", 400)
    }
  })
