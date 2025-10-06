import { Session, User } from '@/server/db/types'
import type { Bindings } from '@/server/lib/context'
import { ApiError } from '@/server/lib/error'
import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { deleteSessionTokenCookie, setSessionTokenCookie } from './auth.utilities'

import { AuthDAO } from '@/server/dao/auth.dao'
const authDAO = new AuthDAO()

export type AuthMiddlewareBindings = Bindings & {
  Variables: {
    user: User | null
    session: Session | null
  }
}

export const authMiddleware = createMiddleware<AuthMiddlewareBindings>(async (c, next) => {
  // 1. Check cookie session.
  const sessionId = getCookie(c, 'session') ?? null

  // 2. Validate sesssion
  const { session, user } = await authDAO.validateSession(sessionId)

  // 3. Set session
  if (session) {
    setSessionTokenCookie(c, session.id, session.expires_at)
  } else {
    deleteSessionTokenCookie(c)
  }

  // 4. Set context values.
  c.set('user', user ?? null)
  c.set('session', session ?? null)

  return next()
})

export type RequireAuthMiddlewareBindings = Bindings & {
  Variables: {
    user: User
    session: Session
  }
}

export const requireAuthMiddleware = createMiddleware<RequireAuthMiddlewareBindings>(
  async (c, next) => {
    if (!c?.var?.session) {
      throw ApiError.InternalServerError('Unauthorized. Please login.')
    }

    return next()
  }
)
