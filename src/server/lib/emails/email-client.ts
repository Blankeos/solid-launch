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

// @ts-expect-error
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
  const { from = FROM, to, subject, html } = params

  const payload = {
    from,
    to: [{ email_address: { address: to } }],
    subject,
    htmlbody: html,
  }

  try {
    const resp = await client.sendMail(payload)
    console.log("[sendEmail] Message sent:", resp)
  } catch (err) {
    console.error("[sendEmail] Error:", JSON.stringify(err))
    throw err
  }
}
