import DodoPayments from "dodopayments"
import type { CheckoutSessionCreateParams } from "dodopayments/resources/checkout-sessions.mjs"
import type { BillingAddress } from "dodopayments/resources/payments.mjs"
import { privateEnv } from "@/env.private"
import { publicEnv } from "@/env.public"

const COMPLETED_CHECKOUT_URL = `${publicEnv.PUBLIC_BASE_URL}/payment/completed`

class DodoClient {
  private dodo: DodoPayments

  constructor() {
    this.dodo = new DodoPayments({
      bearerToken: privateEnv.DODO_PAYMENTS_API_KEY,
      environment: privateEnv.DODO_PAYMENTS_ENV,
    })
  }

  createStaticPaymentLink(productId: string) {
    const origin = `${privateEnv.DODO_PAYMENTS_ENV === "test_mode" ? "test." : ""}checkout.dodopayments.com`
    return `https://${origin}/buy/${productId}?quantity=1&redirect_url=${COMPLETED_CHECKOUT_URL}`
  }

  async createCheckoutSession(params: {
    productId: string
    quantity?: number
    customer?: {
      email: string
      name: string
      phone_number?: string
    }
    billing_address?: BillingAddress
    orderId?: string
    metadata?: Record<string, any>
  }) {
    try {
      // Validate API key is configured
      if (!privateEnv.DODO_PAYMENTS_API_KEY) {
        throw new Error("DODO_PAYMENTS_API_KEY is not configured")
      }

      const payload: CheckoutSessionCreateParams = {
        // Products to sell - use IDs from your Dodo Payments dashboard
        product_cart: [
          {
            product_id: params.productId,
            quantity: params.quantity ?? 1,
          },
        ],

        // Where to redirect after successful payment
        return_url: COMPLETED_CHECKOUT_URL,

        // Custom data for your internal tracking
        metadata: {
          order_id: params.orderId ?? "order_123",
          source: "web_app",
          ...(params.metadata ?? {}),
        },
      }

      // Only include customer if provided
      if (params.customer) {
        payload.customer = params.customer
      }

      // Only include billing address if provided
      if (params.billing_address) {
        payload.billing_address = params.billing_address
      }

      console.log(
        "[create checkout] productId",
        params.productId,
        "|",
        privateEnv.DODO_PAYMENTS_API_KEY
      )

      const session = await this.dodo.checkoutSessions.create({
        ...payload,
      })

      // Redirect your customer to this URL to complete payment
      console.log("Checkout URL:", session.checkout_url)
      console.log("Session ID:", session.session_id)

      return session
    } catch (error) {
      console.error("Failed to create checkout session:", error)
      throw error
    }
  }
}

export const dodoClient = new DodoClient()
