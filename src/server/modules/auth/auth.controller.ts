import { Hono } from 'hono'
import { describeRoute, validator as zValidator } from 'hono-openapi'
import { z } from 'zod'
import { authMiddleware, requireAuthMiddleware } from './auth.middleware'
import { deleteSessionTokenCookie, setSessionTokenCookie } from './auth.utilities'

import { AuthService } from './auth.service'
const authService = new AuthService()

import { AuthDAO } from '@/server/dao/auth.dao'
import { getCookie } from 'hono/cookie'
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
        username: z.string(),
        password: z.string(),
      })
    ),
    async (c) => {
      const { username, password } = c.req.valid('json')

      const { userId, session } = await authService.register({
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
