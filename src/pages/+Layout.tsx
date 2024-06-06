import { IconSolid } from '@/assets/icons';
import { createSignal, FlowProps } from 'solid-js';

// CSS
import '@/styles/app.css';
import '@/styles/nprogress.css';
import { QueryClientProvider } from '@tanstack/solid-query';
import { QueryClient } from '@tanstack/query-core';
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools';
import VerticalLayout from '@/components/layouts/vertical/vercel-layout';
import { CounterContextProvider } from '@/stores/counter.context';
import { Toaster } from 'solid-sonner';

const queryClient = new QueryClient();

export default function App(props: FlowProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SolidQueryDevtools initialIsOpen={false} />
      <CounterContextProvider>
        <VerticalLayout>{props.children}</VerticalLayout>
      </CounterContextProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
