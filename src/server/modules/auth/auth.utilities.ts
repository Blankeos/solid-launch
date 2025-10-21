import type { Context } from "hono"
import { privateEnv } from "@/env.private"
import { publicEnv } from "@/env.public"
import { initHonoClient } from "@/lib/hono-client"

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
      `session=${token}; HttpOnly; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}; Path=/; Secure;`,
      { append: true }
    )
  } else {
    context.header(
      "Set-Cookie",
      `session=${token}; HttpOnly; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}; Path=/`,
      { append: true }
    )
  }
}

export function deleteSessionTokenCookie(context: Context): void {
  if (privateEnv.NODE_ENV === "production") {
    context.header("Set-Cookie", "session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/; Secure;")
  } else {
    context.header("Set-Cookie", "session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/")
  }
}

export function generateId() {
  return Bun.randomUUIDv7()
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

// Redirect Urls (For emails)
export function getMagicLinkVerifyUrl(token: string) {
  initHonoClient(publicEnv.PUBLIC_BASE_URL)
    .auth.login["magic-link"].verify.$url({ query: { token: token } })
    .toString()
}

export function getEmailVerifyUrl(token: string) {
  initHonoClient(publicEnv.PUBLIC_BASE_URL).auth["verify-email"].verify.$url({
    query: { token: token },
  })
}
