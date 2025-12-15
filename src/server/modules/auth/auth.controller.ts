import { Hono } from "hono"
import { getCookie } from "hono/cookie"
import { describeRoute, validator as zValidator } from "hono-openapi"
import { z } from "zod"
import { authMiddleware, requireAuthMiddleware } from "./auth.middleware"
import { AuthService } from "./auth.service"
import { deleteSessionTokenCookie, setSessionTokenCookie } from "./auth.utilities"

const authService = new AuthService()

import { publicEnv } from "@/env.public"
import { ApiError } from "@/server/lib/error"
import {
  RATE_LIMIT_EMAIL_SEND,
  RATE_LIMIT_LOGIN,
  RATE_LIMIT_REGISTER,
  rateLimit,
} from "@/server/lib/rate-limit"
import { s3Client } from "@/server/lib/s3"
import { AuthDAO } from "@/server/modules/auth/auth.dao"
import { AUTH_CONFIG } from "./auth.config"
import { getUserResponseDTO, userMetaClientInputDTO } from "./auth.dto"

const authDAO = new AuthDAO()

export const authController = new Hono<{
  Variables: {
    user: { id: string; username: string } | undefined
    session: { id: string; expiresAt: Date } | undefined
  }
}>()
  .use(describeRoute({ tags: ["Auth"] }))
  .use("/login", rateLimit({ ...RATE_LIMIT_LOGIN }))
  .use("/register", rateLimit({ ...RATE_LIMIT_REGISTER }))
  .use("/login/otp", rateLimit({ ...RATE_LIMIT_EMAIL_SEND }))
  .use("/login/otp/verify", rateLimit({ ...RATE_LIMIT_LOGIN }))
  .use("/login/magic-link", rateLimit({ ...RATE_LIMIT_EMAIL_SEND }))
  .use("/forgot-password", rateLimit({ ...RATE_LIMIT_EMAIL_SEND }))
  .use("/forgot-password/verify", rateLimit({ ...RATE_LIMIT_LOGIN }))
  .use("/verify-email", rateLimit({ ...RATE_LIMIT_EMAIL_SEND }))

  // Get current user
  .get("/", describeRoute({}), authMiddleware, async (c) => {
    const user = c.get("user")
    const session = c.get("session")

    return c.json({
      user: user ? await getUserResponseDTO(user, session) : null,
    })
  })

  // Get authenticated user profile
  .get("/profile", authMiddleware, requireAuthMiddleware, describeRoute({}), async (c) => {
    const user = c.var.user
    const userDetails = await authService.getUserDetails({
      userId: user.id,
      currentSessionId: c.var.session.id,
    })

    return c.json({
      user: userDetails,
    })
  })

  // Update User Profile
  .put(
    "/profile",
    authMiddleware,
    requireAuthMiddleware,
    zValidator("json", userMetaClientInputDTO),
    async (c) => {
      const user = c.var.user
      const updates = c.req.valid("json")

      const updatedUser = await authService.updateUserProfile(user.id, { metadata: updates })

      return c.json({
        user: updatedUser,
      })
    }
  )

  // Generate Avatar Upload URL
  .post(
    "/profile/avatar/upload-url",
    authMiddleware,
    requireAuthMiddleware,
    describeRoute({}),
    async (c) => {
      const user = c.var.user

      // Generate unique filename for avatar
      const objectKey = `avatar_${user.id}`

      const uploadData = await s3Client.generateUploadUrl(objectKey)

      return c.json({
        uploadUrl: uploadData.signedUrl,
        objectKey: objectKey,
      })
    }
  )

  // Get Avatar URL
  .get("/profile/avatar/:uniqueId", async (c) => {
    const uniqueId = c.req.param("uniqueId")
    if (!uniqueId.startsWith("avatar_"))
      throw ApiError.BadRequest("This is not a valid avatar unique id.")

    const url = await s3Client.getSignedUrlFromKey(uniqueId) // Perform caching if too slow

    if (!url) throw ApiError.NotFound("Avatar image not found in our database.")

    return c.redirect(url)
  })

  // Login
  .post(
    "/login",
    zValidator(
      "json",
      z.object({
        email: z.string(),
        password: z.string(),
      })
    ),
    authMiddleware,
    async (c) => {
      const { email, password } = c.req.valid("json")

      const { user, session } = await authService.emailLogin({
        email: email.toLowerCase(),
        password: password,
      })

      setSessionTokenCookie(c, session.id, session.expires_at)

      return c.json({
        user: await getUserResponseDTO(user, session),
      })
    }
  )

  // Logout
  .get("/logout", authMiddleware, requireAuthMiddleware, describeRoute({}), async (c) => {
    const session = c.var.session

    await authDAO.invalidateSession(session.id)

    deleteSessionTokenCookie(c)

    return c.json({
      success: true,
    })
  })

  // Revoke Session
  .post(
    "/revoke",
    authMiddleware,
    requireAuthMiddleware,
    zValidator(
      "json",
      z.object({
        revokeId: z.string(),
      })
    ),
    async (c) => {
      const { revokeId } = c.req.valid("json")
      const user = c.var.user

      const result = await authDAO.revokeSessionByRevokeId({ userId: user.id, revokeId })
      if (!result.success) {
        throw ApiError.NotFound("Session not found or does not belong to user")
      }

      if (c.var.session.revoke_id === revokeId) deleteSessionTokenCookie(c)

      return c.json({ success: true })
    }
  )

  // Register
  .post(
    "/register",
    zValidator(
      "json",
      z.object({
        email: z.email(),
        password: z.string(),
      })
    ),
    async (c) => {
      const validJson = c.req.valid("json")

      const { user, session } = await authService.emailRegister({
        email: validJson.email.toLowerCase(),
        password: validJson.password,
      })

      setSessionTokenCookie(c, session.id, session.expires_at)

      return c.json({
        user: await getUserResponseDTO(user, session),
      })
    }
  )

  // Google Login [redirect]
  .get(
    "/login/google",
    zValidator(
      "query",
      z.object({
        redirect_url: z.string().optional(),
        client_code_challenge: z.string().optional(),
      })
    ),
    async (c) => {
      const { redirect_url, client_code_challenge } = c.req.valid("query")

      const {
        stateCookie,
        codeVerifierCookie,
        redirectUrlCookie,
        pkceChallengeCookie,
        authorizationUrl,
      } = await authService.googleLogin({
        redirectUrl: redirect_url,
        clientCodeChallenge: client_code_challenge,
      })

      c.header("Set-Cookie", stateCookie, { append: true })
      c.header("Set-Cookie", codeVerifierCookie, { append: true })
      c.header("Set-Cookie", redirectUrlCookie, { append: true })
      if (pkceChallengeCookie) c.header("Set-Cookie", pkceChallengeCookie, { append: true })

      return c.redirect(authorizationUrl)
    }
  )

  // Google Login Callback [redirect]
  .get("/login/google/callback", describeRoute({}), async (c) => {
    const allCookies = getCookie(c)
    const storedState = allCookies.google_oauth_state
    const storedCodeVerifier = allCookies.google_oauth_codeverifier
    const storedRedirectUrl = allCookies.google_oauth_redirect_url
    const storedCodeChallenge = allCookies.google_oauth_client_code_challenge

    const code = c.req.query("code")
    const state = c.req.query("state")

    const { session, redirectUrl } = await authService.googleCallback({
      code,
      state,
      storedState,
      storedCodeVerifier,
      storedRedirectUrl,
      storedCodeChallenge,
    })

    if (session) {
      setSessionTokenCookie(c, session.id, session.expires_at)
    }

    return c.redirect(redirectUrl)
  })

  // GitHub Login [redirect]
  .get(
    "/login/github",
    zValidator(
      "query",
      z.object({
        redirect_url: z.string().optional(),
        client_code_challenge: z.string().optional(),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { redirect_url, client_code_challenge } = c.req.valid("query")

      const { stateCookie, redirectUrlCookie, authorizationUrl, pkceChallengeCookie } =
        await authService.githubLogin({
          redirectUrl: redirect_url,
          clientCodeChallenge: client_code_challenge,
        })

      c.header("Set-Cookie", stateCookie, { append: true })
      c.header("Set-Cookie", redirectUrlCookie, { append: true })
      if (pkceChallengeCookie) c.header("Set-Cookie", pkceChallengeCookie, { append: true })

      return c.redirect(authorizationUrl)
    }
  )

  // GitHub Login Callback [redirect]
  .get("/login/github/callback", describeRoute({}), async (c) => {
    const code = c.req.query("code")
    const state = c.req.query("state")

    const cookies = getCookie(c)
    const storedState = cookies.github_oauth_state
    const storedRedirectUrl = cookies.github_oauth_redirect_url
    const storedCodeChallenge = cookies.github_oauth_client_code_challenge

    const { redirectUrl, session } = await authService.githubCallback({
      state,
      code,
      storedState,
      storedRedirectUrl,
      storedCodeChallenge,
    })

    if (session) {
      setSessionTokenCookie(c, session.id, session.expires_at)
    }

    return c.redirect(redirectUrl)
  })

  // OAuth PKCE Token Exchange
  .post(
    "/login/token",
    zValidator(
      "json",
      z.object({
        auth_code: z.string(),
        code_verifier: z.string(),
      })
    ),
    async (c) => {
      const { code_verifier, auth_code } = c.req.valid("json")

      const { user, session } = await authService.pkceLogin({ auth_code, code_verifier })

      setSessionTokenCookie(c, session.id, session.expires_at)

      return c.json({
        user: await getUserResponseDTO(user, session),
      })
    }
  )

  // Send Email OTP
  .post(
    "/login/otp",
    zValidator(
      "json",
      z.object({
        email: z.email(),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { email } = c.req.valid("json")

      const { identifier } = await authService.emailOTPLoginSend({ email: email.toLowerCase() })

      return c.json({ success: true, identifier })
    }
  )

  // Verify Login OTP
  .post(
    "/login/otp/verify",
    zValidator(
      "json",
      z.object({
        identifier: z.string(),
        code: z.string(),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { identifier, code } = c.req.valid("json")

      const { user, session } = await authService.verifyOTPOrTokenLogin({
        identifier,
        code,
      })

      setSessionTokenCookie(c, session.id, session.expires_at)

      return c.json({
        user: await getUserResponseDTO(user, session),
      })
    }
  )

  // Send Magic Link
  .post(
    "/login/magic-link",
    zValidator(
      "json",
      z.object({
        email: z.email(),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { email } = c.req.valid("json")

      await authService.magicLinkLoginSend({ email: email.toLowerCase() })

      return c.json({ success: true })
    }
  )

  // Verify Login High Entropy (Magic Link) [redirect]
  .get(
    "/login/magic-link/verify",
    zValidator(
      "query",
      z.object({
        token: z.string(),
        fallback_url: z.string().optional(),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { token, fallback_url } = c.req.valid("query")

      try {
        const { session } = await authService.verifyOTPOrTokenLogin({ token })

        setSessionTokenCookie(c, session.id, session.expires_at)
      } catch (error: any) {
        const fallbackUrl = new URL(fallback_url || "/", publicEnv.PUBLIC_BASE_URL)
        fallbackUrl.searchParams.set("error", error.message || "Magic link verification failed")
        return c.redirect(fallbackUrl.toString())
      }

      return c.redirect(fallback_url || "/")
    }
  )

  // Forgot Password Send
  .post(
    "/forgot-password",
    zValidator(
      "json",
      z.object({
        email: z.email(),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { email } = c.req.valid("json")

      await authService.forgotPasswordSend({ email: email.toLowerCase() })

      return c.json({ success: true })
    }
  )

  // Forgot Password Verify [redirect] (refactor...)
  .get(
    "/forgot-password/verify",
    zValidator(
      "query",
      z.object({
        token: z.string(),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { token } = c.req.valid("query")

      try {
        await authService.validateTokenIsNotExpired(token)
      } catch (error: any) {
        const fallbackUrl = new URL(publicEnv.PUBLIC_BASE_URL)
        fallbackUrl.searchParams.set("error", error.message || "Password reset verification failed")
        return c.redirect(fallbackUrl.toString())
      }

      const redirectUrl = AUTH_CONFIG.redirectUrls.forgotPasswordVerifyInputPage(token)
      return c.redirect(redirectUrl)
    }
  )

  // Forgot Password Verify
  .post(
    "/forgot-password/verify",
    zValidator(
      "json",
      z.object({
        token: z.string(),
        newPassword: z.string().min(6).max(255),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { token, newPassword } = c.req.valid("json")

      const result = await authService.forgotPasswordVerify({ token, newPassword })

      return c.json(result)
    }
  )

  // Email Verification Send
  .post(
    "/verify-email",
    zValidator(
      "json",
      z.object({
        email: z.email(),
      })
    ),
    async (c) => {
      const { email } = c.req.valid("json")

      await authService.emailVerificationSend({ email: email.toLowerCase() })

      return c.json({ success: true })
    }
  )

  // Email Verification Verify [redirect]
  .get(
    "/verify-email/verify",
    zValidator(
      "query",
      z.object({
        token: z.string(),
        fallback_url: z.string().optional(),
      })
    ),
    async (c) => {
      const { token, fallback_url } = c.req.valid("query")

      try {
        await authService.emailVerificationVerify({ token })
      } catch (error: any) {
        const redirectUrl = new URL(fallback_url || "/", publicEnv.PUBLIC_BASE_URL)
        redirectUrl.searchParams.set("error", error.message || "Email verification failed")
        return c.redirect(redirectUrl.toString())
      }

      return c.redirect(fallback_url || "/")
    }
  )
