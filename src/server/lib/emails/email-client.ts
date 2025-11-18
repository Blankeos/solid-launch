// ===========================================================================
// sendEmail must always follow this type.
// ===========================================================================

export type SendEmailFunction = (params: {
  from?: { address: string; name?: string }
  to: string
  subject: string
  html: string
}) => Promise<void>

// ===========================================================================
// Your custom code here....
// ===========================================================================

import { SendMailClient } from "zeptomail"
import { privateEnv } from "@/env.private"

/** Turns 'Name <name@email.com>' format to { name: 'Name', address: 'name@email.com' } */
const FROM = (() => {
  try {
    const raw = privateEnv.ZEPTOMAIL_FROM
    if (!raw) throw new Error("ZEPTOMAIL_FROM is empty")
    const match = raw.match(/^(.+?)\s*<([^>]+)>$/)
    if (!match) throw new Error("Invalid ZEPTOMAIL_FROM format")
    return { name: match[1].trim(), address: match[2].trim() }
  } catch (err) {
    console.error("[sendEmail] Failed to parse ZEPTOMAIL_FROM:", err)
    throw err
  }
})()

const client = new SendMailClient({
  url: "api.zeptomail.com/",
  token: privateEnv.ZEPTOMAIL_TOKEN,
})

export const sendEmail: SendEmailFunction = async (params) => {
  const { from, to, subject, html } = params

  const fromWithDefault = {
    ...FROM,
    ...from,
  }

  const payload = {
    from: fromWithDefault,
    to: [{ email_address: { address: to } }] as any, // Weird that it needs `name` for email_addresses, but it works so I just any
    subject,
    htmlbody: html,
  }

  if (process.env.DEV_DISABLE_EMAILS) return

  try {
    const response = await client.sendMail(payload)
    console.log("[sendEmail] Message sent:", response)
  } catch (err) {
    console.error("[sendEmail] Error:", JSON.stringify(err))
    throw err
  }
}
