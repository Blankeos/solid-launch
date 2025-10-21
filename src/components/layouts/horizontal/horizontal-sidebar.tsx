import { Show, type VoidProps } from "solid-js"
import { useAuthContext } from "@/features/auth/auth.context"
import { AvatarDropdown } from "@/features/auth/avatar-dropdown"
import { getRoute } from "@/route-tree.gen"

export default function HorizontalSidebar(_props: VoidProps) {
  const { user, loading } = useAuthContext()

  return (
    <div class="flex h-full shrink-0 flex-col border-r bg-sidebar px-8 py-8">
      <div class="flex items-center gap-x-3">
        <a href={getRoute("/")} class="text-4xl text-gray-500">
          {"<"}
        </a>
        <Show when={!loading() && user()}>
          <AvatarDropdown />
        </Show>
      </div>
    </div>
  )
}
