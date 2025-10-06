import { privateEnv } from '@/env.private'
import nodemailer from 'nodemailer'

const FROM = privateEnv.SMTP_FROM

const transporter = nodemailer.createTransport({
  host: privateEnv.SMTP_HOST,
  port: privateEnv.SMTP_PORT,
  secure: privateEnv.SMTP_SECURE,
  auth: {
    user: privateEnv.SMTP_USER,
    pass: privateEnv.SMTP_PASS,
  },
})

export async function sendEmail(params: {
  from?: string
  to: string
  subject: string
  html: string
}) {
  const { from = FROM, to, subject, html } = params

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
  })

  console.log('[sendEmail] Message sent:', info.messageId)
}
