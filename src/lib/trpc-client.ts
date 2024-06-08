import { publicConfig } from '@/config.public';
import type { AppRouter } from '@/server/_app';
import { createTRPCClient, httpBatchLink } from '@trpc/client';

/**
 * A regular TRPC Client that can be used in the browser.
 *
 * Not recommended to use in SSR. Use initTRPCSSRClient instead.
 */
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    // No batching:
    // httpLink({
    // url: `${publicConfig.BASE_ORIGIN}/api`
    // }),

    // With batching:
    httpBatchLink({
      url: `${publicConfig.BASE_ORIGIN}/api`,
    }),
  ],
});
