import { privateEnv } from '@/env.private'
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import { Hono } from 'hono'
import { describeRoute, validator as zValidator } from 'hono-openapi'
import { z } from 'zod'

export const paymentsController = new Hono()
  .use(describeRoute({ tags: ['Payments'] }))
  // Checkout
  .get(
    '/checkout/:variantId',
    zValidator(
      'param',
      z.object({
        variantId: z.string(),
      })
    ),
    async (c) => {
      console.log('🚀 Checkout')
      try {
        const validParam = c.req.valid('param')

        const checkout = await createCheckout(
          privateEnv.LEMONSQUEEZY_STORE_ID,
          validParam.variantId
        )

        const url = checkout.data?.data.attributes.url
        if (!url) {
          throw new Error('Invalid checkout URL')
        }

        return c.redirect(url)
      } catch (error) {
        console.error('Error creating checkout:', error)
        return c.text('Internal Server Error', 500)
      }
    }
  )
  // Lemon Squeezy webhook handler
  .post('/webhook', describeRoute({}), async (c) => {
    try {
      const body = await c.req.json()
      console.log('📬 Webhook received:', body)

      // TODO: Verify webhook signature if needed
      // TODO: Process webhook event based on body.meta.event_name

      return c.text('OK', 200)
    } catch (error) {
      console.error('Error processing webhook:', error)
      return c.text('Internal Server Error', 500)
    }
  })
