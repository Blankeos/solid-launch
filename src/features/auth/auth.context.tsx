import { type Accessor, createSignal, type FlowComponent, onMount } from "solid-js"
import { toast } from "solid-sonner"
import { useData } from "vike-solid/useData"
import { honoClient } from "@/lib/hono-client"

import type { UserResponseDTO } from "@/server/modules/auth/auth.dto"
import { createStrictContext } from "@/utils/create-strict-context"
import { usePostLoginRedirectUrl } from "./use-post-login-redirect-url"

// ===========================================================================
// Mini-TanStack-like mutation helper - so auth.context.tsx is dependencyless
// ===========================================================================
export type MutationState<TArgs = unknown, TData = unknown, TError = unknown> = {
  loading: Accessor<boolean>
  error: Accessor<TError | null>
  run: TArgs extends undefined
    ? () => Promise<TData | null>
    : (options: TArgs) => Promise<TData | null>
}

export function createMutation<TArgs = unknown, TData = unknown, TError = unknown>(
  mutationFn: (options: TArgs) => Promise<TData>
): MutationState<TArgs, TData, TError> {
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal<TError | null>(null)

  const run = (async (options?: TArgs): Promise<TData> => {
    setLoading(true)
    setError(null)
    try {
      const data = await mutationFn(options as TArgs)
      return data
    } catch (err) {
      setError(() => err as TError)
      throw err
    } finally {
      setLoading(false)
    }
  }) as any

  return { loading, error, run }
}

// ===========================================================================
// Context & Hook
// ===========================================================================
export type AuthContextValue = {
  user: Accessor<UserResponseDTO | null>
  loading: Accessor<boolean>

  // Auth functions
  logout: MutationState<undefined, { success: boolean }>
  emailLogin: MutationState<{ email: string; password: string }, UserResponseDTO | null>
  emailRegister: MutationState<{ email: string; password: string }, UserResponseDTO | null>
  forgotPasswordSend: MutationState<{ email: string }, { success: boolean }>
  forgotPasswordVerify: MutationState<{ token: string; newPassword: string }, { success: boolean }>
  refresh: MutationState<undefined, UserResponseDTO | null>

  magicLinkSend: MutationState<{ email: string }, { success: boolean }>
  otpSend: MutationState<{ email: string }, { success: boolean; identifier?: string }>
  otpVerify: MutationState<{ identifier: string; code: string }, UserResponseDTO | null>

  googleLogin: MutationState<{ newWindow?: boolean }, { success: boolean }>
  githubLogin: MutationState<{ newWindow?: boolean }, { success: boolean }>
  revokeSession: MutationState<{ revokeId: string }, { success: boolean }>
}

const [useAuthContext, Provider] = createStrictContext<AuthContextValue>("AuthContext")

export { useAuthContext }

// ===========================================================================
// Provider
// ===========================================================================
export const AuthContextProvider: FlowComponent = (props) => {
  // Opt-in hydration
  const data = useData<{ user: UserResponseDTO }>()

  const [user, setUser] = createSignal<ReturnType<AuthContextValue["user"]>>(data?.user ?? null)
  const [loading, setLoading] = createSignal<boolean>(!data?.user)

  const postLoginRedirectUrl = usePostLoginRedirectUrl()

  const logout = createMutation<undefined, { success: boolean }>(async () => {
    const response = await honoClient.auth.logout.$get()
    const result = await response.json()

    if (result.success) {
      setUser(null)
      return { success: true }
    }

    return { success: false }
  })

  const revokeSession = createMutation<{ revokeId: string }, { success: boolean }>(
    async ({ revokeId }) => {
      const resp = await honoClient.auth.revoke.$post({
        json: { revokeId },
      })
      const _result = await resp.json()
      _fetchCurrentUser()
      return { success: true }
    }
  )

  const emailRegister = createMutation<{ email: string; password: string }, UserResponseDTO | null>(
    async ({ email, password }) => {
      const response = await honoClient.auth.register.$post({
        json: {
          email,
          password,
        },
      })
      const result = await response.json()

      if (result.user) {
        setUser(result.user)
        return result.user
      }

      return null
    }
  )

  const emailLogin = createMutation<{ email: string; password: string }, UserResponseDTO | null>(
    async ({ email, password }) => {
      const response = await honoClient.auth.login.$post({
        json: {
          email: email,
          password: password,
        },
      })
      const result = await response.json()

      if (result.user) {
        setUser(result.user)
        return result.user
      }

      return null
    }
  )

  const forgotPasswordSend = createMutation<{ email: string }, { success: boolean }>(
    async ({ email }) => {
      const response = await honoClient.auth["forgot-password"].$post({
        json: { email },
      })
      const result = await response.json()
      return { success: result.success }
    }
  )

  const forgotPasswordVerify = createMutation<
    { token: string; newPassword: string },
    { success: boolean }
  >(async ({ token, newPassword }) => {
    const response = await honoClient.auth["forgot-password"].verify.$post({
      json: { token, newPassword },
    })
    const result = await response.json()
    return { success: result.success }
  })

  // OAuth utility function
  function _openOAuthUrl(
    url: string,
    options?: {
      newWindow?: boolean
      width?: number
      height?: number
      timeout?: number
    }
  ): Promise<{ success: boolean }> {
    const { newWindow = false, width = 600, height = 700, timeout = 30_000 } = options || {}

    if (newWindow) {
      const popup = window.open(
        url,
        "oauth",
        `popup,width=${width},height=${height},left=${screen.width / 2 - width / 2},top=${screen.height / 2 - height / 2}`
      )
      if (!popup) {
        window.location.href = url
        return Promise.resolve({ success: true })
      }
      return new Promise<{ success: boolean }>((resolve) => {
        const poll = setInterval(() => {
          try {
            // When the popup redirects back to the same origin, close it and finish
            if (popup.closed || popup.location.origin === window.location.origin) {
              clearInterval(poll)
              if (!popup.closed) popup.close()
              _fetchCurrentUser()
              resolve({ success: true })
            }
          } catch {
            // Cross-origin, keep polling
          }
        }, 500)
        // Safety timeout
        setTimeout(() => {
          clearInterval(poll)
          if (!popup.closed) popup.close()
          resolve({ success: true })
        }, timeout)
      })
    }

    window.location.href = url
    return new Promise<{ success: boolean }>((resolve) => {
      setTimeout(() => resolve({ success: true }), timeout)
    })
  }

  const googleLogin = createMutation<{ newWindow?: boolean }, { success: boolean }>(
    async (options) => {
      const url = honoClient.auth.login.google
        .$url({ query: { redirect_url: postLoginRedirectUrl() } })
        .toString()
      return _openOAuthUrl(url, { newWindow: options?.newWindow })
    }
  )

  const githubLogin = createMutation<{ newWindow?: boolean }, { success: boolean }>(
    async (options?: { newWindow?: boolean }) => {
      const url = honoClient.auth.login.github
        .$url({ query: { redirect_url: postLoginRedirectUrl() } })
        .toString()
      return _openOAuthUrl(url, { newWindow: options?.newWindow })
    }
  )

  const magicLinkSend = createMutation<{ email: string }, { success: boolean }>(
    async ({ email }) => {
      const response = await honoClient.auth.login["magic-link"].$post({
        json: { email: email },
      })
      const result = await response.json()
      if (result.success) return { success: true }

      return { success: false }
    }
  )

  const otpSend = createMutation<{ email: string }, { success: boolean; identifier?: string }>(
    async ({ email }) => {
      const response = await honoClient.auth.login.otp.$post({
        json: { email },
      })
      const result = await response.json()
      if (result.success) return { success: true, identifier: result.identifier }
      return { success: false }
    }
  )

  const otpVerify = createMutation<{ identifier: string; code: string }, UserResponseDTO | null>(
    async ({ identifier, code }) => {
      const response = await honoClient.auth.login.otp.verify.$post({
        json: { identifier, code },
      })
      const result = await response.json()
      if (result.user) {
        setUser(result.user)
        return result.user
      }
      return null
    }
  )

  async function _fetchCurrentUser() {
    setLoading(true)
    try {
      const response = await honoClient.auth.$get()
      const result = await response.json()

      if (result.user) {
        setUser(result.user)
        setLoading(false)
      } else {
        setUser(null)
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Could not fetch the user: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const refresh = createMutation<undefined, UserResponseDTO | null>(async () => {
    try {
      const response = await honoClient.auth.$get()
      const result = await response.json()

      if (result.user) {
        setUser(result.user)
        return result.user
      } else {
        setUser(null)
        return null
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Could not refresh the user: ${error.message}`)
      }
      throw error
    }
  })

  // Gets the current user at the start of the app.
  onMount(async () => {
    // Hydrated
    if (user()) {
      setLoading(false)
      return
    }

    // Clientside Fetch
    _fetchCurrentUser()
  })

  return (
    <Provider
      value={{
        user,
        loading,

        logout,
        emailRegister,
        emailLogin,
        forgotPasswordSend,
        forgotPasswordVerify,
        refresh,

        magicLinkSend,
        otpSend,
        otpVerify,

        googleLogin,
        githubLogin,
        revokeSession,
      }}
    >
      {props.children}
    </Provider>
  )
}
