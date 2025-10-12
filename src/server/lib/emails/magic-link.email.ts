export function renderMagicLinkEmail(params: { token: string }): string {
  const { token } = params
  const magicLink = `https://solidlaunch.app/sign-in/magic-link?token=${token}`
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Solid Launch Login</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f5f7fa;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: oklch(0.27 0 0);
          }
          .container {
            max-width: 480px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, oklch(62.3% 0.214 259.815) 0%, oklch(62.3% 0.214 259.815) 100%);
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            color: #ffffff;
            font-weight: 600;
          }
          .content {
            padding: 32px 24px;
            text-align: center;
          }
          .content p {
            margin: 0 0 16px;
            font-size: 16px;
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            background-color: oklch(62.3% 0.214 259.815);
            color: #ffffff;
            border-radius: 8px;
            padding: 12px 24px;
            margin: 20px 0;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
          }
          .footer {
            padding: 24px;
            background-color: oklch(0.97 0 264.54);
            font-size: 14px;
            color: oklch(0.55 0.02 264.36);
            text-align: center;
          }
          .footer a {
            color: oklch(62.3% 0.214 259.815);
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Solid Launch</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Click the button below to log in to your Solid Launch account.</p>
            <a href="${magicLink}" class="button">Log in</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="font-size: 14px; color: oklch(0.55 0.02 264.36); word-break: break-all;">${magicLink}</p>
            <p>This link will expire in 5 minutes. If you didn't request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>Need help? <a href="https://docs.solidlaunch.app" target="_blank">Visit our docs</a>.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
