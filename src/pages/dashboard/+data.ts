import type { PageContext } from "vike/types"
import { initHonoClient } from "@/lib/hono-client"

export type Data = ReturnType<Awaited<typeof data>>

export async function data(pageContext: PageContext) {
  const { urlParsed, request, response } = pageContext

  const hc = initHonoClient(urlParsed.origin!, {
    requestHeaders: request.header(),
    responseHeaders: response.headers,
  })

  const apiResponse = await hc.auth.$get()
  const result = await apiResponse.json()

  return {
    user: result?.user ?? null,
  }
}
