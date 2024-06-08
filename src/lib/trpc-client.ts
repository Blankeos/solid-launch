import { publicConfig } from '@/config.public';
import type { AppRouter } from '@/server/_app';
import { createTRPCClient, httpBatchLink } from '@trpc/client';

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    // httpLink({
    // url: `${publicConfig.BASE_ORIGIN}/api`
    // }),
    httpBatchLink({
      url: `${publicConfig.BASE_ORIGIN}/api`
      // You can pass any HTTP headers you wish here
      // async headers() {
      //   return {
      //     authorization: getAuthCookie(),
      //   };
      // },
    })
  ]
});
