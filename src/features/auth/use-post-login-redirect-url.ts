import { usePageContext } from "vike-solid/usePageContext"
import { getRoute } from "@/route-tree.gen"

/**
 * OAuth Logins are implicitly handled
 * Use this for email login, otp login, etc. magic link however, never handles this.
 */
export function usePostLoginRedirectUrl() {
  const pageContext = usePageContext()

  // ===========================================================================
  // Make sure to edit me ✍️
  // ===========================================================================
  const postLoginRedirectUrl = () =>
    decodeURIComponent(pageContext.urlParsed.search.to ?? getRoute("/dashboard"))

  return postLoginRedirectUrl
}
