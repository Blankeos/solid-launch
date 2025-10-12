import { Hono } from 'hono'
import { describeRoute, validator as zValidator } from 'hono-openapi'
import { z } from 'zod'
import { authMiddleware, requireAuthMiddleware } from './auth.middleware'
import { deleteSessionTokenCookie, setSessionTokenCookie } from './auth.utilities'

import { getCookie } from 'hono/cookie'
import { AuthService } from './auth.service'
const authService = new AuthService()

import { AuthDAO } from '@/server/modules/auth/auth.dao'
const authDAO = new AuthDAO()

export const authController = new Hono<{
  Variables: {
    user: { id: string; username: string } | undefined
    session: { id: string; expiresAt: Date } | undefined
  }
}>()
  .use(describeRoute({ tags: ['Auth'] }))
  // Get current user
  .get('/', authMiddleware, async (c) => {
    const user = c.get('user')
    const session = c.get('session')

    return c.json({
      user: user,
      session: session,
    })
  })

  // Login
  .post(
    '/login',
    zValidator(
      'json',
      z.object({
        username: z.string(),
        password: z.string(),
      })
    ),
    authMiddleware,
    async (c) => {
      const { username, password } = c.req.valid('json')

      const { userId, session } = await authService.login({
        username: username,
        password: password,
      })

      setSessionTokenCookie(c, session.id, session.expires_at)

      return c.json({
        user: {
          id: userId,
          username: username,
        },
      })
    }
  )

  // Logout
  .get('/logout', authMiddleware, requireAuthMiddleware, describeRoute({}), async (c) => {
    const session = c.get('session')

    await authDAO.invalidateSession(session.id)

    deleteSessionTokenCookie(c)

    return c.json({
      success: true,
    })
  })

  // Register
  .post(
    '/register',
    zValidator(
      'json',
      z.object({
        email: z.email(),
        username: z
          .string()
          .min(3)
          .max(30)
          .regex(/^[a-zA-Z0-9_-]+$/),
        password: z.string(),
      })
    ),
    async (c) => {
      const validJson = c.req.valid('json')

      const { userId, session } = await authService.register({
        email: validJson.email,
        username: validJson.username,
        password: validJson.password,
      })

      setSessionTokenCookie(c, session.id, session.expires_at)

      return c.json({
        user: {
          id: userId,
          username: validJson.username,
        },
      })
    }
  )

  // Google Login
  .get('/login/google', describeRoute({}), async (c) => {
    const { redirectUrl } = c.req.query()

    const { stateCookie, codeVerifierCookie, redirectUrlCookie, authorizationUrl } =
      await authService.googleLogin({ redirectUrl })

    c.header('Set-Cookie', stateCookie, { append: true })
    c.header('Set-Cookie', codeVerifierCookie, { append: true })
    c.header('Set-Cookie', redirectUrlCookie, { append: true })

    return c.redirect(authorizationUrl)
  })

  // Google Login Callback
  .get('/login/google/callback', describeRoute({}), async (c) => {
    const allCookies = getCookie(c)
    const storedState = allCookies['google_oauth_state']
    const storedCodeVerifier = allCookies['google_oauth_codeverifier']
    const storedRedirectUrl = allCookies['google_oauth_redirect_url']

    const code = c.req.query('code')
    const state = c.req.query('state')

    const { session, redirectUrl } = await authService.googleCallback({
      code,
      state,
      storedState,
      storedCodeVerifier,
      storedRedirectUrl,
    })

    if (session) {
      setSessionTokenCookie(c, session.id, session.expires_at)
    }

    return c.redirect(redirectUrl)
  })

  // GitHub Login
  .get('/login/github', describeRoute({}), async (c) => {
    const { redirectUrl } = c.req.query()

    const { stateCookie, redirectUrlCookie, authorizationUrl } = await authService.githubLogin({
      redirectUrl,
    })

    c.header('Set-Cookie', stateCookie, { append: true })
    c.header('Set-Cookie', redirectUrlCookie, { append: true })

    return c.redirect(authorizationUrl)
  })

  // GitHub Login Callback
  .get('/login/github/callback', describeRoute({}), async (c) => {
    const code = c.req.query('code')
    const state = c.req.query('state')

    const cookies = getCookie(c)
    const storedState = cookies['github_oauth_state']
    const storedRedirectUrl = cookies['github_oauth_redirect_url']

    const { redirectUrl, session } = await authService.githubCallback({
      state,
      code,
      storedState,
      storedRedirectUrl,
    })

    if (session) {
      setSessionTokenCookie(c, session.id, session.expires_at)
    }

    return c.redirect(redirectUrl)
  })

  // Send Email OTP
  .post(
    '/login/otp',
    zValidator(
      'json',
      z.object({
        email: z.email(),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { email } = c.req.valid('json')

      const { userId } = await authService.sendEmailOTP({ email })

      return c.json({ success: true, userId })
    }
  )

  // Verify Login OTP
  .post(
    '/login/otp/verify',
    zValidator(
      'json',
      z.object({
        userId: z.string(),
        code: z.string(),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { userId, code } = c.req.valid('json')

      const { user, session } = await authService.verifyLoginShortcode({ userId, code })

      setSessionTokenCookie(c, session.id, session.expires_at)

      return c.json({
        user: {
          id: user.id,
          username: user.username,
        },
      })
    }
  )

  // Send Magic Link
  .post(
    '/login/magic-link',
    zValidator(
      'json',
      z.object({
        email: z.email(),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { email } = c.req.valid('json')

      await authService.sendMagicLink({ email })

      return c.json({ success: true })
    }
  )

  // Verify Login High Entropy (Magic Link)
  .post(
    '/login/magic-link/verify',
    zValidator(
      'json',
      z.object({
        token: z.string(),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { token } = c.req.valid('json')

      const { user, session } = await authService.verifyLoginHighEntropy({ token })

      setSessionTokenCookie(c, session.id, session.expires_at)

      return c.json({
        user: {
          id: user.id,
          username: user.username,
        },
      })
    }
  )

  // Forgot Password Send
  .post(
    '/forgot-password',
    zValidator(
      'json',
      z.object({
        email: z.email(),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { email } = c.req.valid('json')

      await authService.forgotPasswordSend({ email })

      return c.json({ success: true })
    }
  )

  // Forgot Password Verify
  .post(
    '/forgot-password/verify',
    zValidator(
      'json',
      z.object({
        token: z.string(),
        newPassword: z.string().min(6).max(255),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { token, newPassword } = c.req.valid('json')

      const result = await authService.forgotPasswordVerify({ token, newPassword })

      return c.json(result)
    }
  )
