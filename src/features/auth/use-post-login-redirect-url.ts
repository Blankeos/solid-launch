import { usePageContext } from "vike-solid/usePageContext"
import { getRoute } from "@/route-tree.gen"

/**
 * OAuth Logins are implicitly handled
 * Use this for email login, otp login, etc. magic link however, never handles this.
 */
export function usePostLoginRedirectUrl() {
  const pageContext = usePageContext()
  const defaultRedirectUrl = getRoute("/dashboard")

  // ===========================================================================
  // Make sure to edit me ✍️
  // ===========================================================================
  const postLoginRedirectUrl = () => {
    const rawTo = pageContext.urlParsed.search.to
    if (!rawTo) return defaultRedirectUrl

    try {
      const decodedTo = decodeURIComponent(rawTo)

      if (!decodedTo.startsWith("/") || decodedTo.startsWith("//")) {
        return defaultRedirectUrl
      }

      return decodedTo
    } catch {
      return defaultRedirectUrl
    }
  }

  return postLoginRedirectUrl
}
