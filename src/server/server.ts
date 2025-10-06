import { privateEnv } from '@/env.private'
import { Hono } from 'hono'
import { appRouter } from './_app'

import { apply } from 'vike-server/hono'
import { serve } from 'vike-server/hono/serve'

const app = new Hono()

import { lemonSqueezyInit } from '@/lib/lemonsqueezy'
lemonSqueezyInit()

// Health checks
app.get('/up', async (c) => {
  return c.newResponse('🟢 UP', { status: 200 })
})

// For the Backend APIs
app.route('/api', appRouter)

// Vike
apply(app, {
  pageContext: (c) => {
    const pageContextInit = {
      urlOriginal: c.hono.req.url,
      request: c.hono.req,
      response: c.hono.res,
    }

    return pageContextInit
  },
})

// Returning errors.
app.onError((error, c) => {
  // Sentry.captureException(error); // Add sentry here or any monitoring service.

  console.error({
    cause: error.cause,
    message: error.message,
    stack: error.stack,
  })

  return c.json(
    {
      error: {
        cause: error.cause,
        message: c.error?.message ?? 'Something went wrong.',
        stack: privateEnv.NODE_ENV === 'production' ? undefined : error.stack,
      },
    },
    error.cause ?? 500
  )
})

// No need to export default (especially Bun).
serve(app, { port: privateEnv.PORT })
