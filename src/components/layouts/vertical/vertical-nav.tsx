import { PageRoutes } from '@/constants/page-routes';
import { useAuthContext } from '@/stores/auth.context';
import { createMemo, For, Show, VoidProps } from 'solid-js';
import { toast } from 'solid-sonner';

type VerticalNavProps = {};

export default function VerticalNav(props: VoidProps<VerticalNavProps>) {
  const { user, loading, logout } = useAuthContext();

  const navLinks = createMemo<{ name: string; href: PageRoutes; visible: boolean }[]>(() => {
    return [
      {
        name: 'Home',
        href: PageRoutes.Home,
        visible: true,
      },
      {
        name: 'About',
        href: PageRoutes.About,
        visible: true,
      },
      {
        name: 'Sign Up',
        href: PageRoutes.SignUp,
        visible: !!!user(),
      },
      {
        name: 'Sign In',
        href: PageRoutes.SignIn,
        visible: !!!user(),
      },
    ];
  });

  return (
    <nav class="flex h-20 items-center justify-between gap-x-5 px-8">
      <a class="flex items-center gap-x-2" href={PageRoutes.Home}>
        <img class="h-16 w-16" src="/icon-logo.svg" />
        <span>Solid Launch</span>
      </a>

      <ul class="flex items-center gap-x-5">
        <For each={navLinks()}>
          {({ name, href, visible }) => (
            <Show when={visible}>
              <li>
                <a href={href}>{name}</a>
              </li>
            </Show>
          )}
        </For>
        <Show when={user()}>
          <button
            onClick={() => {
              logout();
              toast.success('Logged out!');
            }}
          >
            Logout
          </button>
        </Show>

        <Show when={user()}>
          <div
            class="h-12 w-12 flex-shrink-0 rounded-full"
            style={{
              'background-position': 'center',
              'background-size': 'cover',
              'background-image': `url(https://thicc-uwu.mywaifulist.moe/waifus/satoru-gojo-sorcery-fight/bOnNB0cwHheCCRGzjHLSolqabo41HxX9Wv33kfW7.jpg?class=thumbnail)`,
            }}
          />
        </Show>
      </ul>
    </nav>
  );
}
