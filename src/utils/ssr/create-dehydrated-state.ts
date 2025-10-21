import { dehydrate, QueryClient } from "@tanstack/solid-query"

/**
 * A function you can use on the server and pass the queries to be prefetched.
 *
 * ## Server
 * You can also check how to do this {@link https://vike.dev/data-fetching}
 *
 * ```ts
 * // pages/your-page/+data.ts
 * export { data };
 * export type Data = Awaited<ReturnType<typeof data>>;
 *
 * async function data() {
 *    const prefetchQueries = [
 *      {
 *         // Can be "signal-value" is when you use something like
 *         // counter() here, just use its initial value like "1"
 *         queryKey: ["my-key", "signal-value"],
 *         queryFn: async () => {
 *             // your query fn here.
 *         }
 *      }
 * ]
 * }
 *
 * const dehydratedState = await createDehydratedState(prefetchQueries);
 *
 * return { dehydratedState };
 * ```
 *
 * ## Client
 * ```ts
 * const data = useData<Data>();
 * const queryClient = useQueryClient();
 * hydrate(queryClient, data.dehydratedState);
 * ```
 */
export async function createDehydratedState(
  prefetchQueries: { queryKey: string[]; queryFn: () => Promise<any> }[]
) {
  const queryClient = new QueryClient()

  if (prefetchQueries?.length) {
    const queries: Promise<void>[] = []

    prefetchQueries?.forEach(({ queryKey, queryFn }) => {
      queries.push(
        queryClient.prefetchQuery({
          queryKey,
          queryFn,
        })
      )
    })

    await Promise.all(queries)
  }

  return dehydrate(queryClient)
}
