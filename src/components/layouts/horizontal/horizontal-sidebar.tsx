import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageRoutes } from '@/constants/page-routes';
import { useAuthContext } from '@/stores/auth.context';
import { DropdownMenu } from '@kobalte/core/dropdown-menu';
import { Show, VoidProps } from 'solid-js';

type HorizontalSidebarProps = {};

export default function HorizontalSidebar(props: VoidProps<HorizontalSidebarProps>) {
  const { user } = useAuthContext();
  return (
    <div class="flex h-full w-56 flex-shrink-0 flex-col border-r px-8 py-8">
      <div class="flex items-center gap-x-3">
        <a href={PageRoutes.Home} class="text-4xl text-gray-500">
          {'<'}
        </a>
        <Show when={user()}>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div
                class="h-12 w-12 flex-shrink-0 rounded-full"
                style={{
                  'background-position': 'center',
                  'background-size': 'cover',
                  'background-image': `url(https://thicc-uwu.mywaifulist.moe/waifus/satoru-gojo-sorcery-fight/bOnNB0cwHheCCRGzjHLSolqabo41HxX9Wv33kfW7.jpg?class=thumbnail)`,
                }}
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem as="a" href={PageRoutes.Settings}>
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Show>
      </div>
    </div>
  );
}
