import { Hono } from "hono"
import { validator as zValidator } from "hono-openapi"
import { z } from "zod"
import { privateEnv } from "@/env.private"
import { sendEmail } from "./email-client"

function isLoopbackRequest(c: any): boolean {
  const ip =
    (c.req as any).ip ||
    (c.req.raw as any)?.remoteAddress ||
    (c.req.raw as any)?.socket?.remoteAddress

  if (typeof ip !== "string") return false

  const normalizedIp = ip.replace(/^::ffff:/, "")
  return normalizedIp === "127.0.0.1" || normalizedIp === "::1" || normalizedIp === "localhost"
}

export function renderTestEmail(email: string): string {
  return `
    <html>
      <head>
        <title>Test Email</title>
      </head>
      <body>
        <h1>Test Email Render</h1>
        <p>This is a test email sent to: ${email}</p>
        <p>Thank you!</p>
      </body>
    </html>
  `
}

// Only for Hono
export const testEmailRouter = new Hono()
if (privateEnv.NODE_ENV === "development") {
  testEmailRouter.get(
    "/",
    zValidator(
      "query",
      z.object({
        email: z.email(),
      })
    ),
    async (c) => {
      if (!isLoopbackRequest(c)) {
        return c.notFound()
      }

      const validQuery = c.req.valid("query")

      await sendEmail({
        html: renderTestEmail(validQuery.email),
        subject: "Test Email",
        to: validQuery.email,
      })

      return c.json({
        success: true,
        email_sent_to: validQuery.email,
      })
    }
  )
}
