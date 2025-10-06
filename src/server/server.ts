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

// For OpenAPI
import { openAPIRouteHandler } from 'hono-openapi'
app.get(
  '/api/docs/json',
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: 'Solid Launch API',
        version: '1.0.0',
        description: 'API in Hono',
      },
      servers: [{ url: 'http://localhost:3000', description: 'Local Server' }],
    },
  })
)
app.get('/api/docs', (c) => {
  return c.html(`<!doctype html>
<html>
  <head>
    <title>Solid Launch API Reference</title>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <div id="app"></div>
    <!-- Load the Script -->
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <!-- Initialize the Scalar API Reference -->
    <script>
      Scalar.createApiReference('#app', {
        // The URL of the OpenAPI/Swagger document
        url: 'http://localhost:3000/api/docs/json',
        // Avoid CORS issues
        proxyUrl: 'https://proxy.scalar.com',
        theme: 'saturn'
      })
    </script>
  </body>
</html>`)
})

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
