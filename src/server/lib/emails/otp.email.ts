export function renderOtpEmail(params: { email: string; otp: string }): string {
  const { email, otp } = params
  return `
  <html>
    <head>
      <title>Your Solid Launch OTP</title>
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
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">We received a request to sign in to your Solid Launch account (${email}). Use the one-time code below to continue.</p>
                  <table cellpadding="0" cellspacing="0" style="margin:20px auto;">
                    <tr>
                      <td style="background-color:#f7f9ff;border:1px solid #e8ecff;border-radius:8px;padding:12px 20px;font-size:28px;font-weight:700;letter-spacing:4px;color:#2b7fff;">
                        ${otp}
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">This code will expire in 5 minutes. If you didn't request this, you can safely ignore this email.</p>
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
