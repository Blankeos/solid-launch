// 📝 This is the nodemailer implementation.
// This is kept here for flexibility/compatibility w/ other Email Services that support SMTP.
// Generally SMTP is less reliable than API because of a handshake. The zeptomail.ts is my preferred client.
//
// To enable:
// - bun install nodemailer
// - Add these envs to `env.private.ts` and `.env.example`
// SMTP_HOST=""
// SMTP_PORT=465 # or 587
// SMTP_SECURE=true
// SMTP_USER=""
// SMTP_PASS=""
// SMTP_FROM="Example Team <noreply@yourdomain.com>"

// - Finally, uncomment below:

// ------------------------------------------------------------------------------------------

// import { privateEnv } from '@/env.private'
// import nodemailer from 'nodemailer'

// const FROM = privateEnv.SMTP_FROM

// const transporter = nodemailer.createTransport({
//   host: privateEnv.SMTP_HOST,
//   port: privateEnv.SMTP_PORT,
//   secure: privateEnv.SMTP_SECURE,
//   auth: {
//     user: privateEnv.SMTP_USER,
//     pass: privateEnv.SMTP_PASS,
//   },
// })

// /**
//  * @deprecated You can enable this if you want. But I personally use zeptomail.
//  * - To remove it completely: bun uninstall nodemailer, remove all SMTP
//  */
// export async function sendEmail(params: {
//   from?: string
//   to: string
//   subject: string
//   html: string
// }) {
//   const { from = FROM, to, subject, html } = params

//   const info = await transporter.sendMail({
//     from,
//     to,
//     subject,
//     html,
//   })

//   console.log('[sendEmail] Message sent:', info.messageId)
// }
