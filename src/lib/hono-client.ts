import { hc } from "hono/client"
import { HTTPException } from "hono/http-exception"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import type { AppRouter } from "@/server/_app"
import type { ApiErrorResponse } from "@/server/lib/error"

/** Use this on ssr. */
export const initHonoClient = (
  baseUrl: string,
  ssrProxyParams?: {
    requestHeaders?: Record<string, string>
    responseHeaders?: Headers
  }
) =>
  hc<AppRouter>(`${baseUrl}/api`, {
    headers: ssrProxyParams?.requestHeaders ?? {},
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await fetch(input, { ...init, cache: "no-store" })

      if (!response.ok) {
        const json: ApiErrorResponse = await response.json()

        const errorMessage: string | undefined = (() => {
          // Attempt to parse ZodError as a readable message
          if ((json as any)?.error?.name === "ZodError")
            return _formatZodIssues((json as any).error.issues)

          return json.error.message
        })()

        throw new HTTPException(response.status as ContentfulStatusCode, {
          message: errorMessage || response.statusText,
          cause: json.error.cause,
          res: response,
        })
      }

      // This is where we proxy it back.
      for (const [key, value] of response.headers) {
        // Don't set back the Content-Type header (Otherwise, content-type HTML would become a json).
        if (key.toLowerCase() === "content-type") continue
        // Don't set back the Content-Length header (otherwise, content-length 16 would error 500).
        if (key.toLowerCase() === "content-length") continue

        ssrProxyParams?.responseHeaders?.set(key, value) // Even Set-Cookie will be set here.
      }

      return response
    },
  })

const baseurl = typeof window === "undefined" ? "" : (window?.location?.origin ?? "")
/** Use this on the client. */
export const honoClient = initHonoClient(baseurl)

/** Helper to format Zod issues into a readable message */
function _formatZodIssues(
  issues?: Array<{ code: string; message: string; path: string[] }>
): string | undefined {
  if (!issues?.length) return undefined

  return issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ")
}
