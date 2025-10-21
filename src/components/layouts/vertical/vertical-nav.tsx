import { createMemo, For, Show, type VoidProps } from "solid-js"
import { usePageContext } from "vike-solid/usePageContext"
import { IconLoading } from "@/assets/icons"
import { useAuthContext } from "@/features/auth/auth.context"
import { AvatarDropdown } from "@/features/auth/avatar-dropdown"
import { getRoute } from "@/route-tree.gen"
import { cn } from "@/utils/cn"
import { isLinkActive } from "@/utils/is-link-active"

type VerticalNavProps = {
  class?: string
}

export default function VerticalNav(_props: VoidProps<VerticalNavProps>) {
  const { user, loading } = useAuthContext()
  const pageContext = usePageContext()

  const navLinks = createMemo<{ name: string; href: string; visible: () => boolean }[]>(() => {
    return [
      {
        name: "Home",
        href: getRoute("/"),
        visible: () => true,
      },
      {
        name: "About",
        href: getRoute("/about"),
        visible: () => true,
      },
      {
        name: "Sign In",
        href: getRoute("/sign-in"),
        visible: () => !user() && !loading(),
      },
      {
        name: "Sign Up",
        href: getRoute("/sign-up"),
        visible: () => !user() && !loading(),
      },
      {
        name: "Pricing",
        href: getRoute("/pricing"),
        visible: () => true,
      },
    ]
  })

  return (
    <nav class="flex h-20 items-center justify-between gap-x-5 px-8">
      <a class="flex items-center gap-x-2" href={"/"}>
        <img class="h-16 w-16" src="/icon-logo.svg" alt="Solid Launch logo" />
        <span>Solid Launch</span>
      </a>

      <ul class="flex items-center gap-x-5">
        <For each={navLinks()}>
          {({ name, href, visible }) => (
            <Show when={visible()}>
              <li>
                <a
                  href={href}
                  class={cn(isLinkActive(href, pageContext.urlPathname) && "text-blue-500")}
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
          <AvatarDropdown />
        </Show>
      </ul>
    </nav>
  )
}
