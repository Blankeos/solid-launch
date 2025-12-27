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
  /** Gives the forgot-password URL step 1 with token. Redirects to forgotPasswordVerifyInput if successful. Used in EMAIL. */
  forgotPasswordVerifyServerCheck: (token: string) => string
  /** Gives the forgot-password URL step 2 with token. Redirects to frontend. */
  forgotPasswordVerifyInputPage: (token: string) => string
  organizationInvitation: (token: string) => string
}

type OAuthRedirectUrlsConfig = {
  /**
   * Glob patterns for allowed OAuth redirect URLs. Supports domains, subdomains and mobile deep links.
   *
   * Note: Patterns starting with "/" are automatically prefixed with PUBLIC_BASE_URL.
   * For example: "/**" becomes "https://yourdomain.com/**"
   *
   * Examples:
   * - "/**" - All internal paths (auto-converted)
   * - "/projects/**" - Only /projects and subpaths (auto-converted)
   * - "/dashboard" - Only /dashboard exact path (auto-converted)
   * - "https://app.yourdomain.com/**" - Cross-domain redirects
   * - "https://*.yourdomain.com/**" - Any subdomain
   * - "myapp://**" - Mobile deep links
   */
  allowed: string[]
  /**
   * Default redirect URL to use when no redirect_url parameter is provided.
   * / is automatically prefixed with PUBLIC_BASE_URL.
   */
  default: string
}

type AuthConfigInput = {
  session: SessionConfig
  redirectUrls: RedirectUrlsConfig
  oauthRedirectUrls: OAuthRedirectUrlsConfig
}

type AuthConfig = {
  session: Required<SessionConfig>
  redirectUrls: RedirectUrlsConfig
  oauthRedirectUrls: Required<OAuthRedirectUrlsConfig>
}

function createAuthConfig(config: AuthConfigInput): AuthConfig {
  const session = {
    cookie_name: config.session.cookie_name ?? "session",
    ...config.session,
  }

  if (session.expiresInDays <= session.renewWithinDays) {
    throw new Error("AUTH_CONFIG.session.expiresInDays must be greater than renewWithinDays")
  }

  // Auto-convert internal path patterns (starting with /) to use PUBLIC_BASE_URL
  const processedAllowed = config.oauthRedirectUrls.allowed.map((pattern) => {
    if (pattern.startsWith("/")) {
      return `${publicEnv.PUBLIC_BASE_URL.replace(/\/$/, "")}${pattern}`
    }
    return pattern
  })

  return {
    session,
    redirectUrls: config.redirectUrls,
    oauthRedirectUrls: {
      ...config.oauthRedirectUrls,
      allowed: processedAllowed,
    },
  }
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
    forgotPasswordVerifyServerCheck: (token: string) =>
      initHonoClient(publicEnv.PUBLIC_BASE_URL)
        .auth["forgot-password"].verify.$url({ query: { token: token } })
        .toString(),
    forgotPasswordVerifyInputPage: (token: string) =>
      `${publicEnv.PUBLIC_BASE_URL}${getRoute("/forgot-password/verify", { search: { token: token } })}`,
    organizationInvitation: () => "",
  },
  oauthRedirectUrls: {
    allowed: ["/**"],
    default: "/",
  },
})
