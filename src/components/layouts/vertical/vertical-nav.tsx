import { IconLoading } from '@/assets/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import { getRoute } from '@/route-tree.gen';
import { useAuthContext } from '@/stores/auth.context';
import { cn } from '@/utils/cn';
import { isLinkActive } from '@/utils/is-link-active';
import { createMemo, For, Show, VoidProps } from 'solid-js';
import { toast } from 'solid-sonner';
import { usePageContext } from 'vike-solid/usePageContext';

type VerticalNavProps = {};

export default function VerticalNav(_props: VoidProps<VerticalNavProps>) {
  const { user, loading, logout } = useAuthContext();
  const pageContext = usePageContext();

  const navLinks = createMemo<{ name: string; href: string; visible: () => boolean }[]>(() => {
    return [
      {
        name: 'Home',
        href: '/',
        visible: () => true,
      },
      {
        name: 'About',
        href: '/about',
        visible: () => true,
      },
      {
        name: 'Sign In',
        href: '/sign-in',
        visible: () => !user() && !loading(),
      },
      {
        name: 'Sign Up',
        href: '/sign-up',
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
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div
                class="h-12 w-12 shrink-0 rounded-full"
                style={{
                  'background-position': 'center',
                  'background-size': 'cover',
                  'background-image': `url(https://thicc-uwu.mywaifulist.moe/waifus/satoru-gojo-sorcery-fight/bOnNB0cwHheCCRGzjHLSolqabo41HxX9Wv33kfW7.jpg?class=thumbnail)`,
                }}
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem as="a" href={'/dashboard'}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  toast.success('Logged out!');
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Show>
      </ul>
    </nav>
  );
}
