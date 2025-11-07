import type { Env, Input } from "hono"
import { rateLimiter, type Store } from "hono-rate-limiter"
import { ApiError } from "./error"

// Rate limiting utility using hono-rate-limiter
export interface RateLimitOptions {
  /** Time window in milliseconds (default: 15 minutes) */
  windowMs?: number
  /** Max requests per window (default: 100) */
  limit?: number
  /** Function to generate key (default: IP-based) */
  keyGenerator?: (c: any) => string
  /** Custom store (default: MemoryStore) */
  store?: Store<Env, string, Input>
  /** Custom error message for rate limit exceeded */
  message?: string
}

/**
 * NOTE: in localhost, keyGenerator doesn't exist.
 */
export function rateLimit(options: RateLimitOptions = {}) {
  return rateLimiter({
    skip: () => {
      if (process.env.NODE_ENV === "development") return true
      return false
    },
    handler: () => {
      throw ApiError.TooManyRequests(
        options.message ?? "Too many requests, please try again later."
      )
    },
    store: options.store, // Customize the store here (ESPECIALLY IF SERVERLESS)
    windowMs: options.windowMs ?? 15 * 60 * 1000,
    limit: options.limit ?? 100,
    keyGenerator:
      options.keyGenerator ??
      ((c) => {
        // If authMiddleware ran, prefer authenticated user id over IP
        // Also, this isn't used for the global rate limit
        // because auth middlewares are opt-in and called after global rate limit.
        const user = (c as any).get("user")
        if (user?.id) return `user:${user.id}`

        const ip =
          c.req.header("CF-Connecting-IP") ||
          c.req.header("X-Real-IP") ||
          c.req.header("X-Forwarded-For")?.split(",")[0]?.trim() ||
          (c.req as any).ip ||
          "unknown"

        return ip
      }),
  })
}

// Recommended rate limiting defaults for production use
// Based on auth-specific recommendations:

// - Login attempts: 5 per 15 minutes (prevents brute force)
export const RATE_LIMIT_LOGIN = {
  windowMs: 900000, // 15 minutes
  limit: 5,
  message: "Too many login attempts. Please try again in 15 minutes.",
}

// - Registration: 3 per hour (prevents spam accounts)
export const RATE_LIMIT_REGISTER = {
  windowMs: 3600000, // 1 hour
  limit: 3,
  message: "Too many registration attempts. Please try again in 1 hour.",
}

// - OTP verification: 3 per 5 minutes (prevents OTP guessing)
export const RATE_LIMIT_VERIFICATION = {
  windowMs: 300000, // 5 minutes
  limit: 3,
  message: "Too many verification attempts. Please try again in 5 minutes.",
}

// - Email sends (magic links, forgot password): 5 per hour per IP
export const RATE_LIMIT_EMAIL_SEND = {
  windowMs: 3600000, // 1 hour
  limit: 5,
  message: "Too many emails sent. Please try again in 1 hour.",
}

// - Global API limit: 100 requests per minute per IP
export const RATE_LIMIT_GLOBAL = {
  windowMs: 60000, // 1 minute
  limit: 100,
  message: "Too many requests. Please slow down and try again in 1 minute.",
}
