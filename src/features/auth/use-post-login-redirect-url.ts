import { usePageContext } from "vike-solid/usePageContext"
import { getRoute } from "@/route-tree.gen"

export function usePostLoginRedirectUrl() {
  const pageContext = usePageContext()

  // ===========================================================================
  // Make sure to edit me ✍️
  // ===========================================================================
  const postLoginRedirectUrl = () => pageContext.urlParsed.search["to"] ?? getRoute("/dashboard")

  return postLoginRedirectUrl
}
