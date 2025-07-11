import { DropdownMenuComp } from '@/components/ui/dropdown-menu';
import { getRoute } from '@/route-tree.gen';
import { useAuthContext } from '@/stores/auth.context';
import { Show, VoidProps } from 'solid-js';
import { toast } from 'solid-sonner';
import { navigate } from 'vike/client/router';

type HorizontalSidebarProps = {};

export default function HorizontalSidebar(_props: VoidProps<HorizontalSidebarProps>) {
  const { user, loading, logout } = useAuthContext();

  return (
    <div class="flex h-full w-56 shrink-0 flex-col border-r px-8 py-8">
      <div class="flex items-center gap-x-3">
        <a href={getRoute('/')} class="text-4xl text-gray-500">
          {'<'}
        </a>
        <Show when={!loading() && user()}>
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
      </div>
    </div>
  );
}
