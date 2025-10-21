import { Hono } from "hono"
import { validator as zValidator } from "hono-openapi"
import { z } from "zod"
import { publicEnv } from "@/env.public"
import { sendEmail } from "./email-client"

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
if (publicEnv.NODE_ENV === "development") {
  testEmailRouter.get(
    "/",
    zValidator(
      "query",
      z.object({
        email: z.email(),
      })
    ),
    async (c) => {
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
