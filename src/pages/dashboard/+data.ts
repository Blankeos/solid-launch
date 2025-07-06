import { initTRPCSSRClient } from '@/lib/trpc-ssr-client';
import { PageContext } from 'vike/types';

export type Data = ReturnType<Awaited<typeof data>>;

export async function data(pageContext: PageContext) {
  const { urlParsed, request, response } = pageContext;

  const trpcClient = initTRPCSSRClient({
    baseUrl: urlParsed.origin!,
    requestHeaders: request.header(),
    responseHeaders: response.headers,
  });

  const result = await trpcClient.auth.currentUser.query();

  return {
    user: result.user ?? null,
  };
}
