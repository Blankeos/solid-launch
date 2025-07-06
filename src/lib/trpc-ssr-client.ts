import { AppRouter } from '@/server/_app';
import { createTRPCClient, httpBatchLink } from '@trpc/client';

/**
 * Motivation: For TRPC to work seamlessly SSR, we have to proxy the Request and Response headers
 * as if we're in the browser.
 * *
 * To do that, we always need to initialize the trpc client with:
 * - the request headers from the browser
 * - and assign back the response headers back to the browser.
 *
 * If you're doing session auth on http-only cookies, this is super important to use.
 *
 * Reference: Solution on how to read the response headers: https://discord-questions.trpc.io/m/1115562530283196466#solution-1115565818395230289
 *
 * @example
 * // Your data loader function:
 *
 * export const data = async (pageContext: PageContext) => {
 *    const { request, response } = pageContext;
 *
 *    // Every trpc request using this client will now include request headers
 *    // from the browser, and pass response headers back to the browser.
 *    const trpcClient = initTRPCSSRClient({ baseUrl: '...', requestHeaders: request.header(), responseHeaders: response.headers});
 *
 *    const result = await trpcClient.auth.currentUser.query();
 * }
 */
export const initTRPCSSRClient = (params: {
  baseUrl: string;
  /** Pass the request headers sent by the browser here. */
  requestHeaders: Record<string, string>;
  /** Pass the response headers to be sent back to the browser here. */
  responseHeaders: Headers;
}) => {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${params.baseUrl}/api`,

        // Proxy the Request headers from the browser -> server.
        headers: () => params.requestHeaders ?? {},

        // Proxy the Response headers from the server -> browser.
        fetch: async (url, options) => {
          const response = await fetch(url, options);

          // This is where we proxy it back.
          for (const [key, value] of response.headers) {
            // Don't set back the Content-Type header (Otherwise, content-type HTML would become a json).
            if (key.toLowerCase() === 'content-type') continue;
            if (key.toLowerCase() === 'content-length') continue; // Don't set back the content-length, otherwise the browser will cut off the HTML response trpc11 adds this somehow.

            params.responseHeaders?.set(key, value);
          }

          return response;
        },
      }),
    ],
  });
};
