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

import { useMetadata } from 'vike-metadata-solid';

const queryClient = new QueryClient();

useMetadata.setGlobalDefaults({
  title: 'Home | Solid Launch',
  description: 'An awesome app template by Carlo Taleon.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@carlo_taleon',
  },
  otherJSX: () => {
    return (
      <>
        <link rel="icon" href="/icon-logo.svg" />
      </>
    );
  },
});

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
