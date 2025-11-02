import {
  createEffect,
  createSignal,
  type FlowProps,
  Match,
  mergeProps,
  Show,
  Switch,
} from "solid-js"
import { navigate } from "vike/client/router"
import { IconLoading } from "@/assets/icons"
import { useAuthContext } from "@/features/auth/auth.context"
import { getRoute } from "@/route-tree.gen"
import type { UserResponseDTO } from "@/server/modules/auth/auth.dto"

type ProtectedRouteProps = {
  /** Redirect when authenticated. */
  redirect?: string
  /** Fallback when not authed. NOTE: must always be public. @defaultValue /sign-in */
  fallback?: string
  /**
   * Attaches a `?to=<current_path>` if unauthenticated.
   * Which can be used in /sign-in or /sign-up pages to redirect you back to a protected-route.
   * Solves a sensible UX problem of user intention after sign-in.
   *
   * @defaultValue true
   */
  enablePostLoginRedirect?: boolean
  /** Callback to determine if the authenticated user is allowed. Defaults to `() => true`. */
  isAllowed?: (user: UserResponseDTO) => boolean
}

/**
 * A component with side-effects, so make sure to only use it once per page. Like a wrapper.
 */
export default function ProtectedRoute(props: FlowProps<ProtectedRouteProps>) {
  const { user, loading } = useAuthContext()

  const defaultProps = mergeProps(
    { fallback: getRoute("/sign-in"), isAllowed: () => true, enablePostLoginRedirect: true },
    props
  )

  const [showProtector, setShowProtector] = createSignal(!user())

  const buildFallbackWithToParam = () => {
    if (!defaultProps.enablePostLoginRedirect) return defaultProps.fallback

    const currentUrl = new URL(window.location.href)
    const to = encodeURIComponent(currentUrl.pathname + currentUrl.search)
    return `${defaultProps.fallback}?to=${to}`
  }

  createEffect(() => {
    if (loading()) return // Still fetching. Don't do anything.

    const u = user()
    if (!u) {
      // No user, redirect and remove protector
      navigate(buildFallbackWithToParam())
      setShowProtector(false)
      return
    }

    // User exists, check authorization
    if (!defaultProps.isAllowed(u)) {
      // Not allowed, redirect and remove protector
      navigate(buildFallbackWithToParam())
      setShowProtector(false)
      return
    }

    // User is authenticated and authorized
    if (props.redirect) {
      // Redirect when authenticated
      navigate(props.redirect)
      return
    }

    // Remove the protector as no redirect is needed
    setShowProtector(false)
  })

  return (
    <>
      <Show when={showProtector()}>
        <div class="fixed inset-0 flex items-center justify-center gap-x-3 bg-white">
          <Switch>
            <Match when={loading()}>
              <IconLoading />
              Looking for user.
            </Match>

            <Match when={!loading() && user() && defaultProps.isAllowed(user()!) && props.redirect}>
              <IconLoading />
              User found. Redirecting...
            </Match>

            <Match when={!loading() && !user()}>User not found. Unauthorized.</Match>

            <Match when={!loading() && user() && !defaultProps.isAllowed(user()!)}>
              Unauthorized. Redirecting...
            </Match>
          </Switch>
        </div>
      </Show>

      <Show when={user() && !loading() && defaultProps.isAllowed(user()!) && !props.redirect}>
        {props.children}
      </Show>
    </>
  )
}
