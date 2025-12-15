import { apply, serve } from "@photonjs/hono"
import { enhance } from "@universal-middleware/core"
import { Hono } from "hono"
import { privateEnv } from "@/env.private"
import { appRouter } from "./_app"
import type { ApiErrorResponse } from "./lib/error"
import { RATE_LIMIT_GLOBAL, rateLimit } from "./lib/rate-limit"

const app = new Hono()

// Health checks
app.get("/up", async (c) => {
  return c.newResponse("🟢 UP", { status: 200 })
})

// For the Backend APIs
app.use("/api/*", rateLimit({ ...RATE_LIMIT_GLOBAL }))
app.route("/api", appRouter)

import { HTTPException } from "hono/http-exception"
// For OpenAPI
import { openAPIRouteHandler } from "hono-openapi"

if (privateEnv.NODE_ENV === "development") {
  app.get("/api/docs/hono", async (c) => {
    const content = await Bun.file("./apigen/api.d.ts").text()
    return c.text(content, 200, { "Content-Type": "text/plain" })
  })

  app.get(
    "/api/docs/json",
    openAPIRouteHandler(app, {
      documentation: {
        info: {
          title: "Solid Launch API",
          version: "1.0.0",
          description: "API in Hono",
        },
        servers: [{ url: "http://localhost:3000", description: "Local Server" }],
      },
    })
  )
  app.get("/api/docs", (c) => {
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
}

// Vike
apply(app, [
  enhance(
    async (_request, context, runtime) => {
      if (runtime.adapter !== "hono") throw new Error('Expected runtime.adapter to be "hono"')

      context.urlOriginal = runtime.hono.req.url
      context.request = runtime.hono.req
      context.response = runtime.hono.res
    },
    { name: "custom-page-context" }
  ),
])

// Standard Errors
app.onError((error, c) => {
  // Sentry or any monitoring service capture
  // Sentry.captureException(error);

  // 1. Parse into a standard shape.
  const {
    status = 500,
    message = "Internal Server Error",
    cause,
  } = error instanceof HTTPException
    ? error
    : { status: 500, message: "Internal Server Error", cause: error }

  // 2. Create a standard error response shape.
  const errorResponse = {
    error: {
      message,
      code: status,
      cause: privateEnv.NODE_ENV === "production" ? undefined : cause,
      stack: privateEnv.NODE_ENV === "production" ? undefined : error.stack,
    },
  } as ApiErrorResponse

  // 3. Log and return for debugging and frontend displaying.
  const log = {
    ...errorResponse,
    endpoint: c.req.path,
    method: c.req.method,
  }
  console.error(log)

  return c.json(errorResponse, status)
})

export default serve(app, { port: privateEnv.PORT })
