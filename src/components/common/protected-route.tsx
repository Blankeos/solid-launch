import { PageRoutes } from '@/constants/page-routes';
import { useAuthContext } from '@/stores/auth.context';
import { createEffect, createSignal, FlowProps, mergeProps, Show } from 'solid-js';
import { navigate } from 'vike/client/router';

type ProtectedRouteProps = {
  /** Redirect when authenticated. */
  redirect?: string;
  /** Fallback when not authed. @defaultValue /login */
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
        <div class="flex items-center justify-center">Unauthorized</div>
      </Show>

      {props.children}
    </>
  );
}
