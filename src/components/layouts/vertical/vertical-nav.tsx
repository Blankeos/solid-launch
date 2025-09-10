import { IconLoading } from '@/assets/icons';
import { DropdownMenuComp } from '@/components/ui/dropdown-menu';
import { useThemeContext } from '@/contexts/theme.context';
import { getRoute } from '@/route-tree.gen';
import { useAuthContext } from '@/stores/auth.context';
import { cn } from '@/utils/cn';
import { isLinkActive } from '@/utils/is-link-active';
import { createMemo, For, Show, VoidProps } from 'solid-js';
import { toast } from 'solid-sonner';
import { usePageContext } from 'vike-solid/usePageContext';
import { navigate } from 'vike/client/router';

type VerticalNavProps = {};

export default function VerticalNav(_props: VoidProps<VerticalNavProps>) {
  const { user, loading, logout } = useAuthContext();
  const pageContext = usePageContext();
  const { toggleTheme, theme } = useThemeContext();

  const navLinks = createMemo<{ name: string; href: string; visible: () => boolean }[]>(() => {
    return [
      {
        name: 'Home',
        href: getRoute('/'),
        visible: () => true,
      },
      {
        name: 'About',
        href: getRoute('/about'),
        visible: () => true,
      },
      {
        name: 'Sign In',
        href: getRoute('/sign-in'),
        visible: () => !user() && !loading(),
      },
      {
        name: 'Sign Up',
        href: getRoute('/sign-up'),
        visible: () => !user() && !loading(),
      },
    ];
  });

  return (
    <nav class="flex h-20 items-center justify-between gap-x-5 px-8">
      <a class="flex items-center gap-x-2" href={'/'}>
        <img class="h-16 w-16" src="/icon-logo.svg" />
        <span>Solid Launch</span>
      </a>

      <ul class="flex items-center gap-x-5">
        <For each={navLinks()}>
          {({ name, href, visible }) => (
            <Show when={visible()}>
              <li>
                <a
                  href={href}
                  class={cn(isLinkActive(href, pageContext.urlPathname) && 'text-blue-500')}
                >
                  {name}
                </a>
              </li>
            </Show>
          )}
        </For>

        <Show when={loading()}>
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
            <IconLoading color="white" />
          </div>
        </Show>

        <Show when={user() && !loading()}>
          <DropdownMenuComp
            options={[
              { label: 'My Account' },
              {
                itemId: 'dashboard',
                itemDisplay: 'Dashboard',
                itemOnSelect: () => navigate(getRoute('/dashboard')),
              },
              {
                itemId: 'settings',
                itemDisplay: 'Settings',
                itemOnSelect: () => navigate(getRoute('/dashboard/settings')),
              },
              { separator: true },
              {
                itemId: 'theme',
                itemDisplay: `Theme: ${theme()}`,
                itemOnSelect: () => {
                  toggleTheme();
                },
              },
              {
                itemId: 'logout',
                itemDisplay: 'Logout',
                itemOnSelect: () => {
                  logout();
                  toast.success('Logged out!');
                },
              },
            ]}
          >
            <div
              class="h-12 w-12 shrink-0 rounded-full"
              style={{
                'background-position': 'center',
                'background-size': 'cover',
                'background-image': `url(https://thicc-uwu.mywaifulist.moe/waifus/satoru-gojo-sorcery-fight/bOnNB0cwHheCCRGzjHLSolqabo41HxX9Wv33kfW7.jpg?class=thumbnail)`,
              }}
            />
          </DropdownMenuComp>
        </Show>
      </ul>
    </nav>
  );
}
