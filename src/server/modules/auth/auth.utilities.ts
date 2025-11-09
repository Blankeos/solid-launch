import { hash, verify } from "@node-rs/argon2"
import { createId } from "@paralleldrive/cuid2"
import type { Context } from "hono"
import { privateEnv } from "@/env.private"
import { publicEnv } from "@/env.public"
import { AUTH_CONFIG } from "./auth.config"

export function setSessionTokenCookie(context: Context, token: string, expiresAt: string): void {
  /**
   * NOTE: If you're surprised that auth fails in an http ipv4 address after building and previewing. This is the reason.
   *
   * Two things you can do:
   * - Use Caddy reverse proxy and make your local ipv4 into https.
   * - Or just temporarily remove 'Secure' here.
   */
  if (privateEnv.NODE_ENV === "production") {
    context.header(
      "Set-Cookie",
      `${AUTH_CONFIG.session.cookie_name}=${token}; HttpOnly; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}; Path=/; Secure;`,
      { append: true }
    )
  } else {
    context.header(
      "Set-Cookie",
      `${AUTH_CONFIG.session.cookie_name}=${token}; HttpOnly; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}; Path=/`,
      { append: true }
    )
  }
}

export function deleteSessionTokenCookie(context: Context): void {
  if (privateEnv.NODE_ENV === "production") {
    context.header(
      "Set-Cookie",
      `${AUTH_CONFIG.session.cookie_name}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/; Secure;`
    )
  } else {
    context.header(
      "Set-Cookie",
      `${AUTH_CONFIG.session.cookie_name}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`
    )
  }
}

export async function hashPassword(newPassword: string) {
  return hash(newPassword, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  })
}
export async function verifyPassword(passwordHash: string, password: string) {
  return verify(passwordHash, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  })
}

export function generateId() {
  return createId()
}

export function generateUniqueToken() {
  return createId()
}

export function generateUniqueCode() {
  // Generate a random number between 100000 (inclusive) and 999999 (inclusive)
  const min = 100000 // Smallest 6-digit number
  const max = 999999 // Largest 6-digit number
  const range = max - min + 1

  // Use a secure random source for a 32-bit integer
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)

  // Apply modulo operation to fit the range, then add the minimum.
  // Note: Modulo can introduce a slight bias, but it's negligible for this range.
  const randomNumber = (array[0] % range) + min

  return randomNumber.toString() // Returns a 6-digit string
}

export function getClientIP(c: Context): string | null {
  const headersToCheck = [
    "x-forwarded-for",
    "x-real-ip",
    "x-client-ip",
    "cf-connecting-ip", // Cloudflare
    "x-forwarded",
    "forwarded-for",
    "forwarded",
  ] as const

  for (const header of headersToCheck) {
    const value = c.req.header(header)
    if (!value) continue

    // Handle comma-separated IPs (take the first one)
    const ip = value.split(",")[0].trim()

    // Validate it's a real IP (basic validation)
    if (isValidIP(ip)) return ip
  }

  // Fallback to remote address if no valid IP found in headers
  const remoteAddr = (c.env as any)?.remoteAddr || c.req.raw.headers.get("x-remote-addr")
  if (remoteAddr && isValidIP(remoteAddr)) {
    return remoteAddr
  }

  // Last resort: use c.req.raw.cf?.colo (Cloudflare) or c.req.raw.socket?.remoteAddress if available
  const cf = (c.req.raw as any).cf
  if (cf?.colo) {
    return cf.colo
  }

  const socket = (c.req.raw as any).socket
  if (socket?.remoteAddress) {
    return socket.remoteAddress
  }

  return null
}

function isValidIP(ip: string): boolean {
  // Basic IPv4 validation
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

  // Basic IPv6 validation
  const ipv6Regex =
    /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/

  if (ip === "::1" || ip === "127.0.0.1" || ip === "localhost") return false
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}
export function getUserAgentHash(userAgent: string | null): string {
  return userAgent ?? "unknown"
}
export function getSimpleDeviceName(userAgent: string | null): string {
  if (!userAgent) return "Unknown Device"

  if (/android/i.test(userAgent)) return "Android"
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS"
  if (/macintosh|mac os/i.test(userAgent)) return "Mac"
  if (/windows/i.test(userAgent)) return "Windows"
  if (/linux/i.test(userAgent)) return "Linux"

  return "Device"
}

/**
 * Used for oAuth redirect urls.
 * An easy util to parse paths (assumed local, so automatically appends base url to them) or actual urls.
 */
export function normalizeUrlOrPath(input?: string): string {
  if (!input) return publicEnv.PUBLIC_BASE_URL

  // Check if it looks like a full URL (has protocol)
  if (/^https?:\/\//i.test(input)) {
    return input
  }

  // Ensure it starts with a slash
  const path = input.startsWith("/") ? input : `/${input}`

  // Append the public base URL from environment (assumed to be available)
  // Make sure PUBLIC_BASE_URL ends without trailing slash and path starts with slash
  const baseUrl = publicEnv.PUBLIC_BASE_URL.replace(/\/$/, "") ?? ""
  return `${baseUrl}${path}`
}
