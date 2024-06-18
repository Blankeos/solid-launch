import { IconLoading } from '@/assets/icons';
import { PageRoutes } from '@/constants/page-routes';
import { useAuthContext } from '@/stores/auth.context';
import { createEffect, createSignal, FlowProps, Match, mergeProps, Show, Switch } from 'solid-js';
import { navigate } from 'vike/client/router';

type ProtectedRouteProps = {
  /** Redirect when authenticated. */
  redirect?: string;
  /** Fallback when not authed. @defaultValue /sign-in */
  fallback?: string;
};

export default function ProtectedRoute(props: FlowProps<ProtectedRouteProps>) {
  const { user, loading } = useAuthContext();

  const defaultProps = mergeProps({ fallback: PageRoutes.SignIn }, props);

  const [showProtector, setShowProtector] = createSignal(!user());

  createEffect(() => {
    if (loading()) return; // Still fetching. Don't do anything.

    // Stopped fetching. User Exists.
    if (user()) {
      // When there's a user and there's a "redirect". Go to it.
      // Usecase: Going into /login, but there's actually a user.
      if (props.redirect) {
        navigate(props.redirect);
        return;
      }

      // Remove the protector.
      setShowProtector(false);
    }

    if (!user() && !loading()) {
      navigate(defaultProps.fallback);

      // Remove the protector.
      setShowProtector(false);
    }
  });

  return (
    <>
      <Show when={showProtector()}>
        <div class="fixed inset-0 flex items-center justify-center gap-x-3 bg-white">
          <Switch>
            <Match when={loading()}>
              <IconLoading />
              Looking for user.
            </Match>

            <Match when={!loading() && user()}>
              <IconLoading />
              User found. Redirecting...
            </Match>

            <Match when={!loading() && !user()}>User not found. Unauthorized.</Match>
          </Switch>
        </div>
      </Show>

      <Show when={user() && !loading()}>{props.children}</Show>
    </>
  );
}
