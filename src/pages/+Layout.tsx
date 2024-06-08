import { FlowProps } from 'solid-js';

// CSS
import VerticalLayout from '@/components/layouts/vertical/vertical-layout';
import { AuthContextProvider } from '@/stores/auth.context';
import { CounterContextProvider } from '@/stores/counter.context';
import '@/styles/app.css';
import '@/styles/nprogress.css';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/solid-query';
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools';
import { Toaster } from 'solid-sonner';

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
