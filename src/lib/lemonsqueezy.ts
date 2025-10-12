import { privateEnv } from '@/env.private'
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

/** Use in your server's entry point. */
export function lemonSqueezyInit() {
  const apiKey = privateEnv.LEMONSQUEEZY_API_KEY

  lemonSqueezySetup({
    apiKey,
    onError: (error) => console.error('Error!', error),
  })
}
