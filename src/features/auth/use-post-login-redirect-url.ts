import { getRoute } from '@/route-tree.gen'
import { usePageContext } from 'vike-solid/usePageContext'

export function usePostLoginRedirectUrl() {
  const pageContext = usePageContext()

  // ===========================================================================
  // Make sure to edit me ✍️
  // ===========================================================================
  const postLoginRedirectUrl = () => pageContext.urlParsed.search['to'] ?? getRoute('/dashboard')

  return postLoginRedirectUrl
}
