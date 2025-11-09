import { publicEnv } from "@/env.public"
import { initHonoClient } from "@/lib/hono-client"
import { getRoute } from "@/route-tree.gen"

// ===========================================================================
// LIB CODE (Extend as you like, but this is not the main config)
// ===========================================================================
type SessionConfig = {
  /** @defaultValue session */
  cookie_name?: string
  /** Session expires after how many days after it's created. */
  expiresInDays: number
  /** Extend session if it expires within <renewWithinDays> days. (Should always be less than expiresInDays) */
  renewWithinDays: number
}

type RedirectUrlsConfig = {
  /** Gives the magic link verify URL with token. Redirects to serverside. */
  magicLinkVerify: (token: string) => string
  /** Gives the email verify URL with token. Redirects to serverside. */
  emailVerify: (token: string) => string
  /** Gives the forgot-password URL step 1 with token. Redirects to forgotPasswordVerify2 if successful. */
  forgotPasswordVerify1: (token: string) => string
  /** Gives the forgot-password URL step 2 with token. Redirects to serverside. */
  forgotPasswordVerify2: (token: string) => string
  organizationInvitation: (token: string) => string
}

type AuthConfigInput = {
  session: SessionConfig
  redirectUrls: RedirectUrlsConfig
}

type AuthConfig = {
  session: Required<SessionConfig>
  redirectUrls: RedirectUrlsConfig
}

function createAuthConfig(config: AuthConfigInput): AuthConfig {
  const session = {
    cookie_name: config.session.cookie_name ?? "session",
    ...config.session,
  }

  if (session.expiresInDays <= session.renewWithinDays) {
    throw new Error("AUTH_CONFIG.session.expiresInDays must be greater than renewWithinDays")
  }
  return { session, redirectUrls: config.redirectUrls }
}

// ===========================================================================
// ✍️ WRITE THE CONFIG HERE
// ===========================================================================
export const AUTH_CONFIG = createAuthConfig({
  session: {
    expiresInDays: 7,
    renewWithinDays: 3.5,
  },
  redirectUrls: {
    magicLinkVerify: (token: string) =>
      initHonoClient(publicEnv.PUBLIC_BASE_URL)
        .auth.login["magic-link"].verify.$url({ query: { token: token } })
        .toString(),
    emailVerify: (token: string) =>
      initHonoClient(publicEnv.PUBLIC_BASE_URL)
        .auth["verify-email"].verify.$url({ query: { token: token } })
        .toString(),
    forgotPasswordVerify1: (token: string) =>
      initHonoClient(publicEnv.PUBLIC_BASE_URL)
        .auth["forgot-password"].verify.$url({
          query: { token: token },
        })
        .toString(),
    forgotPasswordVerify2: (token: string) =>
      `${publicEnv.PUBLIC_BASE_URL}${getRoute("/forgot-password/verify", { search: { token: token } })}`,
    organizationInvitation: () => "",
  },
})
