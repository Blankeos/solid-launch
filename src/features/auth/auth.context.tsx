import { honoClient } from '@/lib/hono-client'
import {
  createContext,
  createSignal,
  FlowComponent,
  onMount,
  useContext,
  type Accessor,
} from 'solid-js'
import { toast } from 'solid-sonner'

import { useData } from 'vike-solid/useData'

import type { UserResponseDTO } from '@/server/modules/auth/auth.dto'

// ===========================================================================
// Mini-TanStack-like mutation helper - so auth.context.tsx is dependencyless
// ===========================================================================
type MutationState<TArgs = unknown, TData = unknown, TError = unknown> = {
  loading: Accessor<boolean>
  error: Accessor<TError | null>
  run: TArgs extends undefined
    ? () => Promise<TData | null>
    : (options: TArgs) => Promise<TData | null>
}

function createMutation<TArgs = unknown, TData = unknown, TError = unknown>(
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
// Context
// ===========================================================================
export type AuthContextValue = {
  user: Accessor<UserResponseDTO | null>
  loading: Accessor<boolean>

  // Auth functions
  logout: MutationState<undefined, { success: boolean }>
  emailLogin: MutationState<{ email: string; password: string }, UserResponseDTO | null>
  emailRegister: MutationState<{ email: string; password: string }, UserResponseDTO | null>
  magicLinkSend: MutationState<{ email: string }, { success: boolean }>
  magicLinkVerify: MutationState<{ token: string }, UserResponseDTO | null>
  otpSend: MutationState<{ email: string }, { success: boolean; userId?: string }>
  otpVerify: MutationState<{ userId: string; code: string }, UserResponseDTO | null>
  googleLogin: MutationState<{ newWindow?: boolean }, { success: boolean }>
  githubLogin: MutationState<{ newWindow?: boolean }, { success: boolean }>
  revokeSession: MutationState<{ revokeId: string }, { success: boolean }>
}

const AuthContext = createContext({
  user: () => null,
  loading: () => false,
  emailLogin: { loading: () => false, error: () => null, run: async () => null },
  logout: { loading: () => false, error: () => null, run: async () => ({ success: false }) },
  emailRegister: { loading: () => false, error: () => null, run: async () => null },
  magicLinkSend: { loading: () => false, error: () => null, run: async () => ({ success: false }) },
  magicLinkVerify: { loading: () => false, error: () => null, run: async () => null },
  otpSend: { loading: () => false, error: () => null, run: async () => ({ success: false }) },
  otpVerify: { loading: () => false, error: () => null, run: async () => null },
  googleLogin: { loading: () => false, error: () => null, run: async () => ({ success: false }) },
  githubLogin: { loading: () => false, error: () => null, run: async () => ({ success: false }) },
  revokeSession: { loading: () => false, error: () => null, run: async () => ({ success: false }) },
} as AuthContextValue)

// ===========================================================================
// Hook
// ===========================================================================
export const useAuthContext = () => useContext(AuthContext)

// ===========================================================================
// Provider
// ===========================================================================
export const AuthContextProvider: FlowComponent = (props) => {
  // Opt-in hydration
  const data = useData<{ user: UserResponseDTO }>()

  const [user, setUser] = createSignal<ReturnType<AuthContextValue['user']>>(data?.user ?? null)
  const [loading, setLoading] = createSignal<boolean>(data?.user ? false : true)

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
        'oauth',
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
      const url = honoClient.auth.login.google.$url().toString()
      return _openOAuthUrl(url, { newWindow: options?.newWindow })
    }
  )

  const githubLogin = createMutation<{ newWindow?: boolean }, { success: boolean }>(
    async (options?: { newWindow?: boolean }) => {
      const url = honoClient.auth.login.github.$url().toString()
      return _openOAuthUrl(url, { newWindow: options?.newWindow })
    }
  )

  const magicLinkSend = createMutation<{ email: string }, { success: boolean }>(
    async ({ email }) => {
      const response = await honoClient.auth.login['magic-link'].$post({
        json: { email: email },
      })
      const result = await response.json()
      if (result.success) return { success: true }

      return { success: false }
    }
  )

  // FIXME I have not specially tested this yet.
  const magicLinkVerify = createMutation<{ token: string }, UserResponseDTO | null>(
    async ({ token }) => {
      const response = await honoClient.auth.login['magic-link']['verify'].$get({
        query: { token },
      })
      return null
      // const result = await response.json()
      // if (result.user) {
      //   setUser(result.user)
      //   return result.user
      // }
      // return null
    }
  )

  const otpSend = createMutation<{ email: string }, { success: boolean; userId?: string }>(
    async ({ email }) => {
      const response = await honoClient.auth.login.otp.$post({
        json: { email },
      })
      const result = await response.json()
      if (result.success) return { success: true, userId: result.userId }
      return { success: false }
    }
  )

  const otpVerify = createMutation<{ userId: string; code: string }, UserResponseDTO | null>(
    async ({ userId, code }) => {
      const response = await honoClient.auth.login.otp.verify.$post({
        json: { userId, code },
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
        toast.error('Could not fetch the user.')
      }
    } finally {
      setLoading(false)
    }
  }

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
    <AuthContext.Provider
      value={{
        user,
        loading,

        logout,
        emailRegister,
        emailLogin,
        magicLinkSend,
        magicLinkVerify,
        otpSend,
        otpVerify,
        googleLogin,
        githubLogin,
        revokeSession,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  )
}
