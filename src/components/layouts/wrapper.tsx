import { FlowProps } from 'solid-js';

import { Toaster } from 'solid-sonner';

import { AuthContextProvider } from '@/stores/auth.context';
import { CounterContextProvider } from '@/stores/counter.context';

import { ThemeContextProvider, useThemeContext } from '@/contexts/theme.context';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/solid-query';
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools';

const queryClient = new QueryClient();

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
  );
}

function _Toaster() {
  const { inferredTheme } = useThemeContext();

  return <Toaster theme={inferredTheme()} richColors />;
}
