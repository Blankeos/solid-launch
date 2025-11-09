import { getCookie } from "hono/cookie"
import { createMiddleware } from "hono/factory"
import type { Bindings } from "@/server/lib/context"
import { ApiError } from "@/server/lib/error"
import { AuthDAO } from "@/server/modules/auth/auth.dao"

import { AUTH_CONFIG } from "./auth.config"
import type { InternalSessionDTO, InternalUserDTO } from "./auth.dto"
import {
  deleteSessionTokenCookie,
  getClientIP,
  getUserAgentHash,
  setSessionTokenCookie,
} from "./auth.utilities"

const authDAO = new AuthDAO()

export type AuthMiddlewareBindings = Bindings & {
  Variables: {
    user: InternalUserDTO | null
    session: InternalSessionDTO | null
  }
}
export const authMiddleware = createMiddleware<AuthMiddlewareBindings>(async (c, next) => {
  // 1. Check cookie session.
  const sessionId = getCookie(c, AUTH_CONFIG.session.cookie_name) ?? null

  // 2. Validate sesssion
  const { session, user } = await authDAO.validateSession(sessionId)

  // 3. Set session
  if (session) {
    setSessionTokenCookie(c, session.id, session.expires_at)
  } else {
    deleteSessionTokenCookie(c)
  }

  // 4. Update session metadata (fire-and-forget, non-blocking)
  if (session) {
    const clientIP = getClientIP(c)
    const userAgent = c.req.header("user-agent")

    // Only update if we got valid data AND it changed
    if (clientIP && session.ip_address !== clientIP) {
      authDAO.updateSessionIP({ ipAddress: clientIP, sessionId: session.id }).catch(() => {}) // Silent fail
    }

    const uaHash = userAgent ? getUserAgentHash(userAgent) : null
    if (uaHash && session.user_agent_hash !== uaHash) {
      authDAO
        .updateSessionUserAgent({ sessionId: session.id, userAgentHash: uaHash })
        .catch(() => {}) // Silent fail
    }
  }

  // 5. Set context values.
  c.set("user", user ?? null)
  c.set("session", session ?? null)

  return next()
})

export type RequireAuthMiddlewareBindings = Bindings & {
  Variables: {
    user: InternalUserDTO
    session: InternalSessionDTO
  }
}
export const requireAuthMiddleware = createMiddleware<RequireAuthMiddlewareBindings>(
  async (c, next) => {
    if (!c?.var?.session) {
      throw ApiError.InternalServerError("Unauthorized. Please login")
    }

    return next()
  }
)

export type PaidMiddlewareBindings = RequireAuthMiddlewareBindings
export const paidMiddleware = createMiddleware<PaidMiddlewareBindings>(async (_c, _next) => {
  throw ApiError.InternalServerError("Not yet implemented.")
  // if (!c.var.user.metadata?.paid) {
  //   throw ApiError.Unauthorized("Unauthorized. Please buy a subscription.")
  // }
})
