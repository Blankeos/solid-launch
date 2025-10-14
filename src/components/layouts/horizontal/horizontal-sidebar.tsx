import { useAuthContext } from '@/features/auth/auth.context'
import { AvatarDropdown } from '@/features/auth/avatar-dropdown'
import { getRoute } from '@/route-tree.gen'
import { Show, VoidProps } from 'solid-js'

type HorizontalSidebarProps = {}

export default function HorizontalSidebar(_props: VoidProps<HorizontalSidebarProps>) {
  const { user, loading } = useAuthContext()

  return (
    <div class="bg-sidebar flex h-full shrink-0 flex-col border-r px-8 py-8">
      <div class="flex items-center gap-x-3">
        <a href={getRoute('/')} class="text-4xl text-gray-500">
          {'<'}
        </a>
        <Show when={!loading() && user()}>
          <AvatarDropdown />
        </Show>
      </div>
    </div>
  )
}
