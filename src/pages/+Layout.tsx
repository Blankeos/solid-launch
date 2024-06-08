import VerticalLayout from '@/components/layouts/vertical/vertical-layout';
import { FlowProps } from 'solid-js';

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

export default function App(props: FlowProps) {
  return (
    <>
      <AuthContextProvider>
        <QueryClientProvider client={queryClient}>
          <SolidQueryDevtools initialIsOpen={false} />
          <CounterContextProvider>
            <VerticalLayout>{props.children}</VerticalLayout>
          </CounterContextProvider>
        </QueryClientProvider>
      </AuthContextProvider>
      <Toaster />
    </>
  );
}
