import { type JSX, Show, type VoidProps } from "solid-js"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/features/auth/auth.context"
import { AvatarDropdown } from "@/features/auth/avatar-dropdown"
import { getRoute } from "@/route-tree.gen"

function SidebarButton(props: { href: string; children: JSX.Element }) {
  return (
    <Button
      as="a"
      href={props.href}
      variant="ghost"
      size="sm"
      class="w-full justify-start px-3"
      tabIndex={0}
    >
      {props.children}
    </Button>
  )
}

export default function HorizontalSidebar(_props: VoidProps) {
  const { user, loading } = useAuthContext()

  return (
    <div class="flex h-full shrink-0 flex-col bg-sidebar px-4 py-8">
      <div class="flex items-center gap-x-3 px-2">
        <a href={getRoute("/")} class="text-2xl text-gray-500">
          {"<"}
        </a>
        <Show when={!loading() && user()}>
          <AvatarDropdown />
        </Show>
      </div>
      <nav class="mt-8 flex flex-col gap-2">
        <SidebarButton href={getRoute("/dashboard")}>Dashboard</SidebarButton>
        <SidebarButton href={getRoute("/dashboard/settings")}>Settings</SidebarButton>
      </nav>
    </div>
  )
}
