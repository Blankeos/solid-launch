import { QueryClient } from "@tanstack/query-core"
import { QueryClientProvider } from "@tanstack/solid-query"
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools"
import type { FlowProps } from "solid-js"
import { Toaster } from "solid-sonner"
import { CounterContextProvider } from "@/contexts/counter.context"
import { ThemeContextProvider, useThemeContext } from "@/contexts/theme.context"
import { AuthContextProvider } from "@/features/auth/auth.context"
import { useGlobalErrorToast } from "@/hooks/use-global-error-toast"

const queryClient = new QueryClient()

export default function Wrapper(props: FlowProps) {
  return (
    <>
      <AuthContextProvider>
        <QueryClientProvider client={queryClient}>
          <SolidQueryDevtools initialIsOpen={false} />
          <CounterContextProvider>
            <ThemeContextProvider>
              {/* */}
              {props.children}
              {/* */}
              <_Toaster />
            </ThemeContextProvider>
          </CounterContextProvider>
        </QueryClientProvider>
      </AuthContextProvider>
    </>
  )
}

function _Toaster() {
  const { inferredTheme } = useThemeContext()

  useGlobalErrorToast()

  return <Toaster theme={inferredTheme()} richColors />
}
