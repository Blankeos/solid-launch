export function renderMagicLinkEmail(params: { token: string }): string {
  const { token } = params
  const magicLink = `https://solidlaunch.app/sign-in/magic-link?token=${token}`
  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Solid Launch Login</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#454545;">
      <div style="max-width:480px;margin:40px auto;background-color:#ffffff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.08);overflow:hidden;">
        <div style="background-color:oklch(62.3% 0.214 259.815);padding:32px 24px;text-align:center;">
          <h1 style="margin:0;font-size:24px;color:#ffffff;font-weight:600;">Solid Launch</h1>
        </div>
        <div style="padding:32px 24px;text-align:center;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi there,</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Click the button below to log in to your Solid Launch account.</p>
          <a href="${magicLink}" style="display:inline-block;background-color:oklch(62.3% 0.214 259.815);color:#ffffff;border-radius:8px;padding:12px 24px;margin:20px 0;font-size:16px;font-weight:600;text-decoration:none;box-shadow:0 2px 6px rgba(0,0,0,0.12);">Log in</a>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Or copy and paste this link into your browser:</p>
          <p style="margin:0 0 16px;font-size:14px;color:#8a8d9f;word-break:break-all;">${magicLink}</p>
          <p style="margin:0;font-size:16px;line-height:1.6;">This link will expire in 5 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div style="padding:24px;background-color:#f8f9fc;font-size:14px;color:#71738a;text-align:center;">
          <p>Need help? <a href="https://docs.solidlaunch.app" target="_blank" style="color:oklch(62.3% 0.214 259.815);text-decoration:none;">Visit our docs</a>.</p>
        </div>
      </div>
    </body>
  </html>
  `
}
