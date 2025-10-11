import { ApiError } from '@/server/lib/error'
import { hash, verify } from '@node-rs/argon2'

import { github, google } from '@/server/lib/arctic'
import { generateCodeVerifier, generateState, OAuth2RequestError } from 'arctic'

import { privateEnv } from '@/env.private'
import { publicEnv } from '@/env.public'
import { AuthDAO } from '@/server/dao/auth.dao'

export class AuthService {
  public authDAO: AuthDAO
  constructor() {
    this.authDAO = new AuthDAO()
  }

  async login(params: { username: string; password: string }) {
    const { username, password } = params

    if (
      !username ||
      username.length < 3 ||
      username.length > 31 ||
      !/^[a-z0-9_-]+$/.test(username)
    ) {
      throw ApiError.BadRequest('Invalid username')
    }

    if (!password || password.length < 6 || password.length > 255) {
      throw ApiError.BadRequest('Invalid password')
    }

    const existingUser = await this.authDAO.getUserByUsername(username)

    if (!existingUser) {
      // Lie for extra security.
      throw ApiError.BadRequest('Incorrect username or password.')
    }

    const validPassword = await verify(existingUser.password_hash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    if (!validPassword) {
      // Vague for extra security.
      throw ApiError.BadRequest('Incorrect username or password.')
    }

    const session = await this.authDAO.createSession(existingUser.id)
    if (!session) {
      throw ApiError.InternalServerError(
        'Something went wrong, no session was created. Try refreshing or logging in again.'
      )
    }

    return {
      userId: existingUser.id,
      session: session,
    }
  }

  async register(params: { username: string; password: string }) {
    const { username, password } = params

    if (
      !username ||
      username.length < 3 ||
      username.length > 31 ||
      !/^[a-z0-9_-]+$/.test(username)
    ) {
      throw ApiError.BadRequest('Invalid username')
    }

    if (!password || password.length < 6 || password.length > 255) {
      throw ApiError.BadRequest('Invalid password')
    }

    const existingUsername = await this.authDAO.getUserByUsername(username)

    if (existingUsername) {
      throw ApiError.BadRequest(`Username ${username} already exists.`)
    }

    const passwordHash = await hash(password, {
      // recommended minimum parameters
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    })

    const { userId } = await this.authDAO.createUserFromUsernameEmailAndPassword({
      email: '',
      username,
      passwordHash,
    })

    const session = await this.authDAO.createSession(userId)
    if (!session) {
      throw ApiError.InternalServerError(
        'Something went wrong, no session was created. Try refreshing or logging in again.'
      )
    }

    return {
      userId,
      session,
    }
  }

  async githubLogin(params: { redirectUrl?: string } = {}) {
    const state = generateState()
    const url = github.createAuthorizationURL(state, ['user:email', 'read:user'])

    const stateCookie = `github_oauth_state=${state}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/; ${privateEnv.NODE_ENV === 'production' ? 'Secure;' : ''}`
    const redirectUrlCookie = `github_oauth_redirect_url=${params.redirectUrl ?? '/'}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/; ${privateEnv.NODE_ENV === 'production' ? 'Secure;' : ''}`

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
  }) {
    const redirectUrl = new URL(params.storedRedirectUrl ?? `${publicEnv.PUBLIC_BASE_URL}/app`)

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
            username: githubUser.login,
            providerUserId: githubUser.id.toString(),
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
    const redirectUrlCookie = `google_oauth_redirect_url=${params.redirectUrl ?? '/'}; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}; Path=/; ${privateEnv.NODE_ENV === 'production' ? 'Secure;' : ''}`

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
  }) {
    const redirectUrl = new URL(params.storedRedirectUrl ?? `${publicEnv.PUBLIC_BASE_URL}/app`)

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
            username: googleUser.name,
            providerUserId: googleUser.sub,
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

  /** Base implementation for otp types (i.e. email, magic link, sms otp). But also two-factor. */
  private async _baseOtpSend(params: {
    onSendOtp: (onSendOtpOptions: {
      userId: string
      code: string
      name: string
      email: string
    }) => void
  }) {
    // DAO to create an OTP
    // Email Send
  }

  async emailOtpSend() {
    // TODO: Implement _baseOtpSend but using email.
  }

  async magicLinkSend() {
    // TODO: Implement _baseOtpSend but using magic link.
  }

  async smsOtpSend() {
    // TODO: Implement _baseOtpsend but using sms provider (i.e. Semaphore or Twilio).
  }

  /** Applies for all _baseOtpSend implementations. */
  async otpVerifyLogin(params: { userId: string; code: string }) {
    // TODO: 1. Use the consume dao for it.
    // TODO: 2. Get details based on userId, return the user dto to finish the login.
  }
}
