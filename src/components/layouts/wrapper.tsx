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
            {/* <button
              class="rounded bg-yellow-500 px-5 py-1"
              onClick={() => setCounter(counter() + 1)}
            >
              Root Wrapper Signal: {counter()} (If this resets to 0, the layout re-mounted)
            </button> */}
            {props.children}
          </CounterContextProvider>
        </QueryClientProvider>
      </AuthContextProvider>
      <Toaster />
    </>
  );
}
