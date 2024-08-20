import { initTRPCSSRClient } from '@/lib/trpc-ssr-client';
import { PageContext } from 'vike/types';

export type Data = ReturnType<Awaited<typeof data>>;

export async function data(pageContext: PageContext) {
  const { request, response } = pageContext;

  const trpcClient = initTRPCSSRClient(request.header(), response.headers);

  const result = await trpcClient.auth.currentUser.query();

  return {
    user: result.user ?? null,
  };
}
