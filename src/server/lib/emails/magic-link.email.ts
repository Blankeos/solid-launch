export function renderMagicLinkEmail(params: { token: string }): string {
  const { token } = params
  const magicLink = `https://solidlaunch.app/sign-in/magic-link?token=${token}`
  return `
  <html>
    <head>
      <title>Solid Launch Login</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#454545;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa;">
        <tr>
          <td align="center" valign="top">
            <table width="480" cellpadding="0" cellspacing="0" style="margin:40px auto;background-color:#ffffff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.08);overflow:hidden;">
              <tr>
                <td style="background-color:#2b7fff;padding:32px 24px;text-align:center;">
                  <h1 style="margin:0;font-size:24px;color:#ffffff;font-weight:600;">Solid Launch</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 24px;text-align:center;">
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi there,</p>
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Click the button below to log in to your Solid Launch account.</p>
                  <table cellpadding="0" cellspacing="0" style="margin:20px auto;">
                    <tr>
                      <td style="background-color:#2b7fff;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.12);">
                        <a href="${magicLink}" style="display:inline-block;color:#ffffff;padding:12px 24px;font-size:16px;font-weight:600;text-decoration:none;">Log in</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Or copy and paste this link into your browser:</p>
                  <p style="margin:0 0 16px;font-size:14px;color:#71738a;word-break:break-all;">${magicLink}</p>
                  <p style="margin:0;font-size:16px;line-height:1.6;">This link will expire in 5 minutes. If you didn't request this, you can safely ignore this email.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px;background-color:#f8f9fc;font-size:14px;color:#71738a;text-align:center;">
                  <p>Need help? <a href="https://docs.solidlaunch.app" target="_blank" style="color:#2b7fff;text-decoration:none;">Visit our docs</a>.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `
}
