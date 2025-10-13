import { Hono } from 'hono'
import { describeRoute, validator as zValidator } from 'hono-openapi'
import { z } from 'zod'
import { authMiddleware, requireAuthMiddleware } from './auth.middleware'
import { deleteSessionTokenCookie, setSessionTokenCookie } from './auth.utilities'

import { getCookie } from 'hono/cookie'
import { AuthService } from './auth.service'
const authService = new AuthService()

import {
  RATE_LIMIT_EMAIL_SEND,
  RATE_LIMIT_LOGIN,
  RATE_LIMIT_REGISTER,
  rateLimit,
} from '@/server/lib/rate-limit'
import { AuthDAO } from '@/server/modules/auth/auth.dao'
import { getUserResponseDTO } from './auth.dto'
const authDAO = new AuthDAO()

export const authController = new Hono<{
  Variables: {
    user: { id: string; username: string } | undefined
    session: { id: string; expiresAt: Date } | undefined
  }
}>()
  .use(describeRoute({ tags: ['Auth'] }))
  .use('/login', rateLimit({ ...RATE_LIMIT_LOGIN }))
  .use('/register', rateLimit({ ...RATE_LIMIT_REGISTER }))
  .use('/login/otp', rateLimit({ ...RATE_LIMIT_EMAIL_SEND }))
  .use('/login/magic-link', rateLimit({ ...RATE_LIMIT_EMAIL_SEND }))
  .use('/forgot-password', rateLimit({ ...RATE_LIMIT_EMAIL_SEND }))
  .use('/verify-email', rateLimit({ ...RATE_LIMIT_EMAIL_SEND }))

  // Get current user
  .get('/', authMiddleware, async (c) => {
    const user = c.get('user')
    const session = c.get('session')

    return c.json({
      user: user ? getUserResponseDTO(user) : null,
      session: session,
    })
  })

  // Get authenticated user profile
  .get('/profile', authMiddleware, requireAuthMiddleware, describeRoute({}), async (c) => {
    const user = c.var.user
    const userDetails = await authService.getUserDetails(user.id)

    return c.json({
      user: userDetails,
    })
  })

  // Login
  .post(
    '/login',
    zValidator(
      'json',
      z.object({
        email: z.string(),
        password: z.string(),
      })
    ),
    authMiddleware,
    async (c) => {
      const { email, password } = c.req.valid('json')

      const { user, session } = await authService.emailLogin({
        email: email,
        password: password,
      })

      setSessionTokenCookie(c, session.id, session.expires_at)

      return c.json({
        user: getUserResponseDTO(user),
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
        password: z.string(),
      })
    ),
    async (c) => {
      const validJson = c.req.valid('json')

      const { user, session } = await authService.emailRegister({
        email: validJson.email,
        password: validJson.password,
      })

      setSessionTokenCookie(c, session.id, session.expires_at)

      return c.json({
        user: getUserResponseDTO(user),
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
        user: getUserResponseDTO(user),
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
        user: getUserResponseDTO(user),
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

  // Email Verification Send
  .post(
    '/verify-email',
    zValidator(
      'json',
      z.object({
        email: z.email(),
      })
    ),
    async (c) => {
      const { email } = c.req.valid('json')

      await authService.emailVerificationSend({ email })

      return c.json({ success: true })
    }
  )

  // Email Verification Verify
  .post(
    '/verify-email/verify',
    zValidator(
      'json',
      z.object({
        token: z.string(),
      })
    ),
    async (c) => {
      const { token } = c.req.valid('json')

      const result = await authService.emailVerificationVerify({ token })

      return c.json(result)
    }
  )
