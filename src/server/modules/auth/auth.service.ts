import { ApiError } from '@/server/lib/error'
import { hash, verify } from '@node-rs/argon2'

import { github, google } from '@/server/lib/arctic'
import { generateCodeVerifier, generateState, OAuth2RequestError } from 'arctic'

import { privateEnv } from '@/env.private'
import { publicEnv } from '@/env.public'
import { sendEmail } from '@/server/lib/emails/email-client'
import { renderMagicLinkEmail } from '@/server/lib/emails/magic-link.email'
import { renderOtpEmail } from '@/server/lib/emails/otp.email'
import { AuthDAO } from '@/server/modules/auth/auth.dao'
import { InternalSessionDTO, InternalUserDTO } from './auth.dto'

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
  public authDAO: AuthDAO
  constructor() {
    this.authDAO = new AuthDAO()
  }

  async emailLogin(params: { email: string; password: string }): UserSessionResponse {
    const { email, password } = params

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw ApiError.BadRequest('Invalid email')
    }

    if (!password || password.length < 6 || password.length > 255) {
      throw ApiError.BadRequest('Invalid password')
    }

    const existingUser = await this.authDAO.getUserByEmail(email)

    if (!existingUser) {
      // Lie for extra security.
      throw ApiError.BadRequest('Incorrect email or password')
    }

    const validPassword = await verify(existingUser.password_hash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })
    if (!validPassword) {
      // Vague for extra security.
      throw ApiError.BadRequest('Incorrect email or password')
    }

    const session = await this.authDAO.createSession(existingUser.id)
    if (!session) {
      throw ApiError.InternalServerError(
        'Something went wrong, no session was created. Try refreshing or logging in again'
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
      throw ApiError.BadRequest('Invalid password')
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw ApiError.BadRequest('Invalid email')
    }

    const existingEmail = await this.authDAO.getUserByEmail(email)

    if (existingEmail) {
      throw ApiError.BadRequest(`Email ${email} already exists.`)
    }

    const passwordHash = await hash(password, {
      // recommended minimum parameters
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    const user = await this.authDAO.createUserFromEmailAndPassword({
      email,
      passwordHash,
    })
    if (!user) {
      throw ApiError.InternalServerError('Something went wrong while creating your user')
    }

    const session = await this.authDAO.createSession(user.id)
    if (!session) {
      throw ApiError.InternalServerError(
        'Something went wrong, no session was created. Try refreshing or logging in again'
      )
    }

    return {
      user,
      session,
    }
  }

  async githubLogin(params: { redirectUrl?: string } = {}) {
    const state = generateState()
    const url = github.createAuthorizationURL(state, ['user:email', 'read:user'])

    const stateCookie = `github_oauth_state=${state}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/; ${privateEnv.NODE_ENV === 'production' ? 'Secure;' : ''}`
    const redirectUrlCookie = `github_oauth_redirect_url=${params.redirectUrl ?? publicEnv.PUBLIC_BASE_URL}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/; ${privateEnv.NODE_ENV === 'production' ? 'Secure;' : ''}`

    return {
      stateCookie,
      redirectUrlCookie,
      authorizationUrl: url.toString(),
    }
  }

  async githubCallback(params: {
    state?: string
    code?: string
    storedState?: string
    storedRedirectUrl?: string
    useOneTimeToken?: boolean
  }): OAuthCallbackResponse {
    const redirectUrl = new URL(params.storedRedirectUrl ?? `${publicEnv.PUBLIC_BASE_URL}`)

    if (
      !params.code ||
      !params.state ||
      !params.storedState ||
      params.state !== params.storedState
    ) {
      redirectUrl.searchParams.append(
        'error',
        'No GitHub OAuth State cookie found. Try logging in again.'
      )
      return {
        statusText: 'No GitHub OAuth State cookie found. Try logging in again.',
        redirectUrl: redirectUrl.toString(),
      }
    }

    try {
      const tokens = await github.validateAuthorizationCode(params.code)

      const githubUserResponse = await fetch('https://api.github.com/user', {
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
        const githubEmailsResponse = await fetch('https://api.github.com/user/emails', {
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

      const getOrCreateUser = async () => {
        const existingAccount = await this.authDAO.getOAuthAccount(
          'github',
          githubUser.id.toString()
        )

        if (existingAccount) {
          return existingAccount.user_id
        }

        const existingDatabaseUserWithEmail = await this.authDAO.getUserByEmail(githubUser.email!)

        if (existingDatabaseUserWithEmail) {
          await this.authDAO.linkOAuthAccount({
            providerId: 'github',
            providerUserId: githubUser.id.toString(),
            userId: existingDatabaseUserWithEmail.id,
          })

          return existingDatabaseUserWithEmail.id
        } else {
          const user = await this.authDAO.createUserFromOAuth({
            provider: 'github',
            email: githubUser.email!,
            providerUserId: githubUser.id.toString(),
            metadata: {
              name: githubUser.name,
              avatar_url: githubUser.avatar_url,
            },
          })

          return user.id
        }
      }

      const userId = await getOrCreateUser()

      const session = await this.authDAO.createSession(userId)
      if (!session) throw new Error('Could not create session.')

      return {
        statusText: 'Authenticated successfully.',
        redirectUrl: redirectUrl.toString(),
        session: session,
      }
    } catch (e) {
      console.log(e)

      if (e instanceof OAuth2RequestError) {
        redirectUrl.searchParams.append('error', 'Invalid GitHub OAuth Code.')
        return {
          statusText: 'Invalid GitHub OAuth Code.',
          redirectUrl: redirectUrl.toString(),
        }
      }

      redirectUrl.searchParams.append('error', 'Unknown error during authentication with GitHub.')
      return {
        statusText: 'Unknown error.',
        redirectUrl: redirectUrl.toString(),
      }
    }
  }

  async googleLogin(params: { redirectUrl?: string } = {}) {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const url = google.createAuthorizationURL(state, codeVerifier, ['profile', 'email'])

    const stateCookie = `google_oauth_state=${state}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/; ${privateEnv.NODE_ENV === 'production' ? 'Secure;' : ''}`
    const codeVerifierCookie = `google_oauth_codeverifier=${codeVerifier}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/; ${privateEnv.NODE_ENV === 'production' ? 'Secure;' : ''}`
    const redirectUrlCookie = `google_oauth_redirect_url=${params.redirectUrl ?? `${publicEnv.PUBLIC_BASE_URL}`}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/; ${privateEnv.NODE_ENV === 'production' ? 'Secure;' : ''}`

    url.searchParams.append('prompt', 'select_account')

    return {
      stateCookie,
      codeVerifierCookie,
      redirectUrlCookie,
      authorizationUrl: url.toString(),
    }
  }

  async googleCallback(params: {
    state?: string
    code?: string
    storedState?: string
    storedCodeVerifier?: string
    storedRedirectUrl?: string
    useOneTimeToken?: boolean
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
        'error',
        'No Google OAuth State cookie found. Try logging in again.'
      )
      return {
        statusText: 'No Google OAuth State cookie found. Try logging in again.',
        redirectUrl: redirectUrl.toString(),
      }
    }

    try {
      const tokens = await google.validateAuthorizationCode(params.code, params.storedCodeVerifier)

      const googleUserResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
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

      const getOrCreateUser = async () => {
        const existingAccount = await this.authDAO.getOAuthAccount('google', googleUser.sub)

        if (existingAccount) {
          return existingAccount.user_id
        }

        const existingDatabaseUserWithEmail = await this.authDAO.getUserByEmail(googleUser.email)

        if (existingDatabaseUserWithEmail) {
          await this.authDAO.linkOAuthAccount({
            providerId: 'google',
            providerUserId: googleUser.sub,
            userId: existingDatabaseUserWithEmail.id,
          })

          return existingDatabaseUserWithEmail.id
        } else {
          const user = await this.authDAO.createUserFromOAuth({
            provider: 'google',
            email: googleUser.email,
            providerUserId: googleUser.sub,
            metadata: {
              avatar_url: googleUser.picture,
              name: googleUser.name,
            },
          })

          return user.id
        }
      }

      const userId = await getOrCreateUser()

      const session = await this.authDAO.createSession(userId)
      if (!session) throw new Error('Could not create session.')

      return {
        statusText: 'Authenticated successfully.',
        redirectUrl: redirectUrl.toString(),
        session: session,
      }
    } catch (e) {
      console.log(e)

      if (e instanceof OAuth2RequestError) {
        redirectUrl.searchParams.append('error', 'Invalid Google OAuth Code.')
        return {
          statusText: 'Invalid Google OAuth Code.',
          redirectUrl: redirectUrl.toString(),
        }
      }

      redirectUrl.searchParams.append('error', 'Unknown error during authentication with Google.')
      return {
        statusText: 'Unknown error.',
        redirectUrl: redirectUrl.toString(),
      }
    }
  }

  async sendEmailOTP(params: { email: string }) {
    const user = await this.authDAO.getUserByEmail(params.email)
    if (!user) throw ApiError.NotFound('User with this email not found')

    const token = await this.authDAO.createOneTimeToken({
      userId: user.id,
      tokenType: 'shortcode',
      purpose: 'otp',
    })
    console.debug('🪙 [emailOtpSend] Token', token)

    // IMPLEMENT SEND EMAIL
    try {
      const html = renderOtpEmail({ email: user.email, otp: token })
      await sendEmail({ html, subject: 'Your Solid Launch OTP', to: user.email })
    } catch (_err) {
      console.error('[emailOtpSend] error', _err)
    }

    return { userId: user.id }
  }

  async sendMagicLink(params: { email: string }) {
    const user = await this.authDAO.getUserByEmail(params.email)
    if (!user) throw ApiError.NotFound('User with this email not found')

    const token = await this.authDAO.createOneTimeToken({
      userId: user.id,
      purpose: 'otp',
    })
    console.debug('🪙 [magiclinkOtpSend] Token', token)

    // IMPLEMENT SEND EMAIL
    try {
      const _html = renderMagicLinkEmail({ token: token })
      // await sendEmail({ html, subject: 'Your Solid Launch Magic Link', to: user.email })
    } catch (_err) {
      console.error('[magiclinkOtpSend] error', _err)
    }

    return { userId: user.id }
  }

  async sendSmsOTP(params: { email: string }) {
    const user = await this.authDAO.getUserByEmail(params.email)
    if (!user) throw ApiError.NotFound('User with this email not found')

    const token = await this.authDAO.createOneTimeToken({
      userId: user.id,
      purpose: 'otp',
    })
    console.debug('🪙 [smsOtpSend] Token', token)

    // IMPLEMENT SMS
    try {
      console.log(`[smsOtpSend] SMS placeholder for token ${token}`)
      // await sendSms({ phone: user.phone, message: `Your OTP is: ${token}` })
    } catch (_err) {
      console.error('[smsOtpSend] error', _err)
    }

    return { userId: user.id }
  }

  /** Applies for userId + code combinations (i.e. short codes) */
  async verifyLoginShortcode(params: { userId: string; code: string }): UserSessionResponse {
    const { consumed } = await this.authDAO.consumeOneTimeToken({
      token: params.code,
      userId: params.userId,
      purpose: 'otp',
    })

    if (!consumed) {
      throw ApiError.BadRequest('Code for login is either invalid or expired')
    }

    const user = await this.authDAO.getUserByUserId(params.userId)
    const session = await this.authDAO.createSession(params.userId)

    if (!user || !session) {
      throw ApiError.InternalServerError('Login failed: user or session missing')
    }

    return {
      user,
      session,
    }
  }

  /** Applies for high entropy purposes where user id is hidden (i.e. magic_link, cross_domain) */
  async verifyLoginHighEntropy(params: { token: string }): UserSessionResponse {
    const { consumed, userId } = await this.authDAO.consumeOneTimeToken({
      token: params.token,
      purpose: 'otp',
    })

    if (!consumed || !userId) {
      throw ApiError.BadRequest('Token for login is either invalid or expired')
    }

    const user = await this.authDAO.getUserByUserId(userId)
    const session = await this.authDAO.createSession(userId)

    if (!user || !session) {
      throw ApiError.InternalServerError('Login failed: user or session missing')
    }

    return {
      user,
      session,
    }
  }

  async forgotPasswordSend(params: { email: string }) {
    const user = await this.authDAO.getUserByEmail(params.email)
    if (!user) throw ApiError.NotFound('User with this email not found')

    const token = await this.authDAO.createOneTimeToken({
      userId: user.id,
      purpose: 'reset_password',
    })
    console.debug('🔐 [forgotPasswordSend] Token', token)

    // IMPLEMENT SEND EMAIL
  }

  async forgotPasswordVerify(params: { token: string; newPassword: string }) {
    const { consumed, userId } = await this.authDAO.consumeOneTimeToken({
      token: params.token,
      purpose: 'reset_password',
    })

    if (!consumed || !userId) {
      throw ApiError.BadRequest('Token for password reset is either invalid or expired')
    }

    if (!params.newPassword || params.newPassword.length < 6 || params.newPassword.length > 255) {
      throw ApiError.BadRequest('Invalid new password')
    }

    const passwordHash = await hash(params.newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    await this.authDAO.updateUserPassword({
      userId,
      passwordHash,
    })

    await this.authDAO.invalidateAllSessionsByUser(userId)

    return {
      success: true,
    }
  }

  async emailVerificationSend(params: { email: string }) {
    const user = await this.authDAO.getUserByEmail(params.email)
    if (!user) throw ApiError.NotFound('User with this email not found')

    const token = await this.authDAO.createOneTimeToken({
      userId: user.id,
      purpose: 'email_verification',
    })
    console.debug('📧 [emailVerificationSend] Token', token)

    // IMPLEMENT SEND EMAIL
    try {
      const html = renderMagicLinkEmail({ token: token })
      await sendEmail({ html, subject: 'Verify your email address', to: user.email })
    } catch (_err) {
      console.error('[emailVerificationSend] error', _err)
    }

    return { userId: user.id }
  }

  async emailVerificationVerify(params: { token: string }) {
    const { consumed, userId } = await this.authDAO.consumeOneTimeToken({
      token: params.token,
      purpose: 'email_verification',
    })

    if (!consumed || !userId) {
      throw ApiError.BadRequest('Token for email verification is either invalid or expired')
    }

    await this.authDAO.updateUserVerifiedEmail({ userId })

    return {
      success: true,
    }
  }
}
