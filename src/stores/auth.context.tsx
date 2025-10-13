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
  googleLogin: MutationState<undefined, void>
  githubLogin: MutationState<undefined, void>
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
  googleLogin: { loading: () => false, error: () => null, run: async () => {} },
  githubLogin: { loading: () => false, error: () => null, run: async () => {} },
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

  const googleLogin = createMutation<undefined, void>(async () => {
    const url = honoClient.auth.login.google.$url().toString()
    window.location.href = url
    // Fake await to make the function awaitable – page will navigate away long before this resolves (10s)
    await new Promise<void>((resolve) => setTimeout(resolve, 10_000))
  })

  const githubLogin = createMutation<undefined, void>(async () => {
    const url = honoClient.auth.login.github.$url().toString()
    window.location.href = url
    // Fake await to make the function awaitable – page will navigate away long before this resolves (10s)
    await new Promise<void>((resolve) => setTimeout(resolve, 10_000))
  })

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

  const magicLinkVerify = createMutation<{ token: string }, UserResponseDTO | null>(
    async ({ token }) => {
      const response = await honoClient.auth.login['magic-link']['verify'].$post({
        json: { token },
      })
      const result = await response.json()
      if (result.user) {
        setUser(result.user)
        return result.user
      }
      return null
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

  // Gets the current user at the start of the app.
  onMount(async () => {
    // Hydrated
    if (user()) {
      setLoading(false)
      return
    }

    // Clientside Fetch
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
      }}
    >
      {props.children}
    </AuthContext.Provider>
  )
}
