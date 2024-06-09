import { createSignal, FlowProps } from 'solid-js';

// CSS
import '@/styles/app.css';
import '@/styles/nprogress.css';

import { Toaster } from 'solid-sonner';

import { AuthContextProvider } from '@/stores/auth.context';
import { CounterContextProvider } from '@/stores/counter.context';

import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/solid-query';
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools';

const queryClient = new QueryClient();

export default function Wrapper(props: FlowProps) {
  const [counter, setCounter] = createSignal(0);

  return (
    <>
      <AuthContextProvider>
        <QueryClientProvider client={queryClient}>
          <SolidQueryDevtools initialIsOpen={false} />
          <CounterContextProvider>
            <button class="w-20 bg-yellow-500" onClick={() => setCounter(counter() + 1)}>
              {counter()}
            </button>
            {props.children}
          </CounterContextProvider>
        </QueryClientProvider>
      </AuthContextProvider>
      <Toaster />
    </>
  );
}
