import { generateCodeVerifier, generateState, OAuth2RequestError } from "arctic"
import z from "zod"
import { privateEnv } from "@/env.private"
import { publicEnv } from "@/env.public"
import { github, google } from "@/server/lib/arctic"
import {
  renderForgotPasswordEmail,
  renderMagicLinkEmail,
  renderOtpEmail,
  sendEmail,
} from "@/server/lib/emails"
import { ApiError } from "@/server/lib/error"
import { verifyCodeVerifier } from "@/server/lib/pkce"
import { AuthDAO } from "@/server/modules/auth/auth.dao"
import { assertDTO } from "@/server/utils/assert-dto"
import { AUTH_CONFIG } from "./auth.config"
import type { InternalSessionDTO, InternalUserDTO, UserMetaClientInputDTO } from "./auth.dto"
import { getOAuthRedirectUrl, jsonDecode, verifyPassword } from "./auth.utilities"

type UserSessionResponse = Promise<{ user: InternalUserDTO; session: InternalSessionDTO }>

/**
 * Note: OAuth Callbacks should not throw errors
 * - for cross-domain compatibility, so they don't get stuck in the endpoint and still redirect back to the desired url, in case.
 * - Instead, an error message can be given so the redirectedUrl can know about it.
 */
type OAuthCallbackResponse = Promise<{
  user?: InternalUserDTO
  session?: InternalSessionDTO
  statusText?: string
  redirectUrl: string
}>

export class AuthService {
  private authDAO: AuthDAO
  constructor() {
    this.authDAO = new AuthDAO()
  }

  async getUserDetails(params: { userId: string; currentSessionId?: string }) {
    const userDetails = await this.authDAO.getUserDetails({
      userId: params.userId,
      currentSessionId: params.currentSessionId,
    })
    if (!userDetails) throw ApiError.NotFound("No user found")
    return userDetails
  }

  async updateUserProfile(userId: string, updates: { metadata?: Partial<UserMetaClientInputDTO> }) {
    return await this.authDAO.updateUserMetadata({
      userId,
      metadata: updates.metadata,
    })
  }

  // 👉 Email & Password
  async emailLogin(params: { email: string; password: string }): UserSessionResponse {
    const { email, password } = params

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw ApiError.BadRequest("Invalid email")
    }

    if (!password || password.length < 6 || password.length > 255) {
      throw ApiError.BadRequest("Invalid password")
    }

    const existingUser = await this.authDAO.getUserByEmail(email)

    if (!existingUser) {
      throw ApiError.BadRequest("Incorrect email or password") // Vague for extra security
    }

    const validPassword = await verifyPassword(existingUser.password_hash, password)
    if (!validPassword) {
      throw ApiError.BadRequest("Incorrect email or password") // Vague for extra security.
    }

    const session = await this.authDAO.createSession(existingUser.id)
    if (!session) {
      throw ApiError.InternalServerError(
        "Something went wrong, no session was created. Try refreshing or logging in again"
      )
    }

    return {
      user: existingUser,
      session,
    }
  }

  async emailRegister(params: { email: string; password: string }): UserSessionResponse {
    const { email, password } = params

    if (!password || password.length < 6 || password.length > 255) {
      throw ApiError.BadRequest("Invalid password")
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw ApiError.BadRequest("Invalid email")
    }

    const existingEmail = await this.authDAO.getUserByEmail(email)

    if (existingEmail) {
      throw ApiError.BadRequest(`Email ${email} already exists.`)
    }

    const user = await this.authDAO.createUserFromEmailAndPassword({
      email,
      password: password,
    })
    if (!user) {
      throw ApiError.InternalServerError("Something went wrong while creating your user")
    }

    const session = await this.authDAO.createSession(user.id)
    if (!session) {
      throw ApiError.InternalServerError(
        "Something went wrong, no session was created. Try refreshing or logging in again"
      )
    }

    return {
      user,
      session,
    }
  }

  async emailVerificationSend(params: { email: string }) {
    const user = await this.authDAO.getUserByEmail(params.email)
    if (!user) throw ApiError.NotFound("User with this email not found")

    if (user.email_verified) {
      throw ApiError.BadRequest("Email already verified")
    }

    const token = await this.authDAO.createOneTimeToken({
      identifier: user.id,
      purpose: "email_verification",
    })
    console.debug("📧 [emailVerificationSend] Token", token)

    try {
      const html = renderMagicLinkEmail({ token: token })
      await sendEmail({ html, subject: "Verify your email address", to: user.email })
    } catch (_err) {
      console.error("[emailVerificationSend] error", _err)
    }

    return { userId: user.id }
  }

  async emailVerificationVerify(params: { token: string }) {
    const { consumed, identifier } = await this.authDAO.consumeOneTimeToken({
      token: params.token,
      purpose: "email_verification",
    })

    if (!consumed || !identifier) {
      throw ApiError.BadRequest("Token for email verification is either invalid or expired")
    }

    // Identifier is always assumed as userId since user always exists.
    await this.authDAO.updateUserVerifiedEmail({ userId: identifier })

    return {
      success: true,
    }
  }

  async forgotPasswordSend(params: { email: string }) {
    const user = await this.authDAO.getUserByEmail(params.email)
    if (!user) throw ApiError.NotFound("User with this email not found")

    const token = await this.authDAO.createOneTimeToken({
      identifier: user.id,
      purpose: "reset_password",
    })
    console.debug("🔐 [forgotPasswordSend] Token", token)

    try {
      const html = renderForgotPasswordEmail({ token: token })
      await sendEmail({ html, subject: "Your Solid Launch OTP", to: user.email })
    } catch (_err) {
      console.error("[emailOtpSend] error", _err)
    }
  }

  async forgotPasswordVerify(params: { token: string; newPassword: string }) {
    const { consumed, identifier } = await this.authDAO.consumeOneTimeToken({
      token: params.token,
      purpose: "reset_password",
    })

    if (!consumed || !identifier) {
      throw ApiError.BadRequest("Token for password reset is either invalid or expired")
    }

    // Identifier is always assumed as userId since user always exists.
    await this.authDAO.updateUserPassword({
      userId: identifier,
      password: params.newPassword,
    })

    await this.authDAO.invalidateAllSessionsByUser(identifier)

    return {
      success: true,
    }
  }

  // 👉  OAuth
  async githubLogin(params: { redirectUrl?: string; clientCodeChallenge?: string } = {}) {
    const state = generateState()
    const authUrl = github.createAuthorizationURL(state, ["user:email", "read:user"])

    const normalizedRedirectUrl = getOAuthRedirectUrl(params?.redirectUrl)

    const stateCookie = `github_oauth_state=${state}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/; ${privateEnv.NODE_ENV === "production" ? "Secure;" : ""}`
    const redirectUrlCookie = `github_oauth_redirect_url=${normalizedRedirectUrl}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/; ${privateEnv.NODE_ENV === "production" ? "Secure;" : ""}`
    const pkceChallengeCookie = params.clientCodeChallenge
      ? `github_oauth_client_code_challenge=${params.clientCodeChallenge}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/; ${privateEnv.NODE_ENV === "production" ? "Secure;" : ""}`
      : undefined

    return {
      stateCookie,
      redirectUrlCookie,
      pkceChallengeCookie,
      authorizationUrl: authUrl.toString(),
    }
  }

  async githubCallback(params: {
    state?: string
    code?: string
    storedState?: string
    storedRedirectUrl?: string
    storedCodeChallenge?: string
  }): OAuthCallbackResponse {
    const redirectUrl = new URL(params.storedRedirectUrl ?? `${publicEnv.PUBLIC_BASE_URL}`)

    if (
      !params.code ||
      !params.state ||
      !params.storedState ||
      params.state !== params.storedState
    ) {
      redirectUrl.searchParams.append(
        "error",
        "No GitHub OAuth State cookie found. Try logging in again."
      )
      return {
        statusText: "No GitHub OAuth State cookie found. Try logging in again.",
        redirectUrl: redirectUrl.toString(),
      }
    }

    try {
      const tokens = await github.validateAuthorizationCode(params.code)

      const githubUserResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      })

      const githubUser: {
        id: number
        login: string
        email?: string
        name: string
        avatar_url: string
      } = await githubUserResponse.json()

      if (!githubUser.email) {
        const githubEmailsResponse = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${tokens.accessToken()}`,
          },
        })
        const githubEmails: {
          email: string
          verified: boolean
          primary: boolean
        }[] = await githubEmailsResponse.json()

        githubUser.email =
          githubEmails.find((email) => email.primary && email.verified)?.email ??
          githubEmails.find((email) => email.verified)?.email
      }

      const userId = await this.authDAO.getOrCreateUserIdForOAuth({
        email: githubUser.email!,
        provider: "github",
        providerUserId: githubUser.id.toString(),
        metadata: {
          name: githubUser.login,
          avatar_url: githubUser.avatar_url,
        },
      })

      if (params.storedCodeChallenge) {
        const authCode = await this.authDAO.createOneTimeToken({
          identifier: userId,
          purpose: "pkce",
          metadata: { code_challenge: params.storedCodeChallenge },
          expiresInSeconds: 30,
        })
        redirectUrl.searchParams.append("auth_code", authCode)
        return {
          statusText: "Authenticated via PKCE successfully",
          redirectUrl: redirectUrl.toString(),
        }
      }

      const session = await this.authDAO.createSession(userId)
      if (!session) throw new Error("Could not create session.")

      return {
        statusText: "Authenticated successfully.",
        redirectUrl: redirectUrl.toString(),
        session: session,
      }
    } catch (e) {
      console.log(e)

      if (e instanceof OAuth2RequestError) {
        redirectUrl.searchParams.append("error", "Invalid GitHub OAuth Code.")
        return {
          statusText: "Invalid GitHub OAuth Code.",
          redirectUrl: redirectUrl.toString(),
        }
      }

      redirectUrl.searchParams.append("error", "Unknown error during authentication with GitHub.")
      return {
        statusText: "Unknown error.",
        redirectUrl: redirectUrl.toString(),
      }
    }
  }

  async googleLogin(params: { redirectUrl?: string; clientCodeChallenge?: string } = {}) {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const authUrl = google.createAuthorizationURL(state, codeVerifier, ["profile", "email"])

    const normalizedRedirectUrl = getOAuthRedirectUrl(params?.redirectUrl)

    const stateCookie = `google_oauth_state=${state}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/; ${privateEnv.NODE_ENV === "production" ? "Secure;" : ""}`
    const codeVerifierCookie = `google_oauth_codeverifier=${codeVerifier}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/; ${privateEnv.NODE_ENV === "production" ? "Secure;" : ""}`
    const redirectUrlCookie = `google_oauth_redirect_url=${normalizedRedirectUrl}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/; ${privateEnv.NODE_ENV === "production" ? "Secure;" : ""}`
    const pkceChallengeCookie = params.clientCodeChallenge
      ? `google_oauth_client_code_challenge=${params.clientCodeChallenge}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/; ${privateEnv.NODE_ENV === "production" ? "Secure;" : ""}`
      : undefined

    authUrl.searchParams.append("prompt", "select_account")

    return {
      stateCookie,
      codeVerifierCookie,
      redirectUrlCookie,
      pkceChallengeCookie,
      authorizationUrl: authUrl.toString(),
    }
  }

  async googleCallback(params: {
    state?: string
    code?: string
    storedState?: string
    storedCodeVerifier?: string
    storedRedirectUrl?: string
    storedCodeChallenge?: string
  }): OAuthCallbackResponse {
    const redirectUrl = new URL(params.storedRedirectUrl ?? `${publicEnv.PUBLIC_BASE_URL}`)

    if (
      !params.code ||
      !params.state ||
      !params.storedState ||
      !params.storedCodeVerifier ||
      params.state !== params.storedState
    ) {
      redirectUrl.searchParams.append(
        "error",
        "No Google OAuth State cookie found. Try logging in again."
      )
      return {
        statusText: "No Google OAuth State cookie found. Try logging in again.",
        redirectUrl: redirectUrl.toString(),
      }
    }

    try {
      const tokens = await google.validateAuthorizationCode(params.code, params.storedCodeVerifier)

      const googleUserResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      })

      const googleUser: {
        sub: string
        email: string
        email_verified: boolean
        name: string
        picture: string
      } = await googleUserResponse.json()

      const userId = await this.authDAO.getOrCreateUserIdForOAuth({
        email: googleUser.email,
        provider: "google",
        providerUserId: googleUser.sub,
        metadata: {
          name: googleUser.name,
          avatar_url: googleUser.picture,
        },
      })

      if (params.storedCodeChallenge) {
        const authCode = await this.authDAO.createOneTimeToken({
          identifier: userId,
          purpose: "pkce",
          metadata: { code_challenge: params.storedCodeChallenge },
          expiresInSeconds: 30,
        })
        redirectUrl.searchParams.append("auth_code", authCode)
        return {
          statusText: "Authenticated via PKCE successfully",
          redirectUrl: redirectUrl.toString(),
        }
      }

      const session = await this.authDAO.createSession(userId)
      if (!session) throw new Error("Could not create session.")

      return {
        statusText: "Authenticated successfully.",
        redirectUrl: redirectUrl.toString(),
        session: session,
      }
    } catch (e) {
      console.log(e)

      if (e instanceof OAuth2RequestError) {
        redirectUrl.searchParams.append("error", "Invalid Google OAuth Code.")
        return {
          statusText: "Invalid Google OAuth Code.",
          redirectUrl: redirectUrl.toString(),
        }
      }

      redirectUrl.searchParams.append("error", "Unknown error during authentication with Google.")
      return {
        statusText: "Unknown error.",
        redirectUrl: redirectUrl.toString(),
      }
    }
  }

  async pkceLogin(params: { auth_code: string; code_verifier: string }) {
    const token = await this.authDAO.getOneTimeToken(params.auth_code)
    if (!token) {
      throw ApiError.Unauthorized("Invalid or expired PKCE authorization code")
    }

    if (token.purpose !== "pkce") {
      throw ApiError.Unauthorized("Invalid token purpose")
    }

    if (!token.identifier) {
      throw ApiError.InternalServerError("Something went wrong on our server")
    }

    const tokenMeta = assertDTO(
      jsonDecode(token?.metadata as string),
      z.object({ code_challenge: z.string() })
    )

    const ok = await verifyCodeVerifier(params.code_verifier, tokenMeta.code_challenge)
    if (!ok) {
      throw ApiError.Unauthorized("Invalid code verifier")
    }

    await this.authDAO.consumeOneTimeToken({ token: token.token })

    const user = await this.authDAO.getUserByUserId(token.identifier)
    const session = await this.authDAO.createSession(token.identifier)

    if (!user || !session) {
      throw ApiError.InternalServerError("Login failed: user or session missing")
    }

    return {
      user,
      session,
    }
  }

  // 👉 OTT Logins (OTP, Magic Link)
  async emailOTPLoginSend(params: { email: string }) {
    const token = await this.authDAO.createOneTimeToken({
      tokenType: "shortcode",
      purpose: "otp",
      identifier: params.email,
      metadata: { email: params.email },
    })
    console.debug("🪙 [emailOtpSend] Token", token)

    try {
      const html = renderOtpEmail({ email: params.email, otp: token })
      await sendEmail({ html, subject: "Your Solid Launch OTP", to: params.email })
    } catch (_err) {
      console.error("[emailOtpSend] error", _err)
    }

    return { identifier: params.email }
  }

  async magicLinkLoginSend(params: { email: string }) {
    const token = await this.authDAO.createOneTimeToken({
      purpose: "otp",
      identifier: params.email,
      metadata: { email: params.email },
    })
    console.debug(
      "🪙 [magiclinkOtpSend] Token",
      token,
      AUTH_CONFIG.redirectUrls.magicLinkVerify(token)
    )

    try {
      const html = renderMagicLinkEmail({ token: token })
      await sendEmail({ html, subject: "Your Solid Launch Magic Link", to: params.email })
    } catch (_err) {
      console.error("[magiclinkOtpSend] error", _err)
    }

    return { identifier: params.email }
  }

  /** @notimplemented */
  async smsOTPLoginSend(_params: { phone: string }) {
    //   const normalizedPhone = normalizePhoneNumber(params.phone)
    //   const existingUserFromPhone = await this.authDAO.getUserByPhoneNumber(params.phone)
    //   if (!existingUserFromPhone && !params.email) {
    //     throw ApiError.BadRequest("New users must have an email to register.")
    //   }
    //
    //   const token = await this.authDAO.createOneTimeToken({
    //     userId: user.id,
    //     purpose: "otp",
    //     metadata: { email: params.email },
    //   })
    //   console.debug("🪙 [smsOtpSend] Token", token)
    //   // IMPLEMENT SMS
    //   try {
    //     await sendSms({ phone: user.phone, message: `Your OTP is: ${token}` })
    //   } catch (_err) {
    //     console.error("[smsOtpSend] error", _err)
    //   }
    //   return { userId: user.id }
  }

  async validateTokenIsNotExpired(token: string) {
    const _token = await this.authDAO.getOneTimeToken(token)
    if (!_token) {
      throw ApiError.BadRequest("No token found")
    }
    if (new Date() >= new Date(_token.expires_at)) {
      // IMRPOVEMENT: DELETE the token.
      throw ApiError.BadRequest("Token expired or invalid")
    }
    return true
  }

  async verifyOTPOrTokenLogin(params: {
    identifier?: string
    token?: string
    code?: string
  }): UserSessionResponse {
    const { identifier, token, code } = params

    if (!token && !code) {
      throw ApiError.BadRequest("Either token or code must be provided")
    }
    if (code && !identifier) {
      throw ApiError.BadRequest("Both code and userId must be provided")
    }

    const { consumed, metadata } = await this.authDAO.consumeOneTimeToken({
      token,
      code,
      identifier,
      purpose: "otp",
    })

    if (!consumed) {
      throw ApiError.BadRequest("Token or code for login is either invalid or expired")
    }

    const resolvedMetadata = jsonDecode(metadata as any) as { email: string } // LAZY but maybe zod this

    const user = await this.authDAO.getOrCreateUserFromEmail(resolvedMetadata.email)
    if (!user) {
      throw ApiError.InternalServerError("Login failed: unable to determine user")
    }

    const session = await this.authDAO.createSession(user.id)
    if (!session) {
      throw ApiError.InternalServerError("Login failed: session missing")
    }

    return {
      user,
      session,
    }
  }
}
