import { toast } from "solid-sonner"
import { navigate } from "vike/client/router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenuComp } from "@/components/ui/dropdown-menu"
import { useThemeContext } from "@/contexts/theme.context"
import { getRoute } from "@/route-tree.gen"
import { useAuthContext } from "./auth.context"

export function AvatarDropdown() {
  const { theme, toggleTheme } = useThemeContext()
  const { user, logout } = useAuthContext()

  return (
    <DropdownMenuComp
      options={[
        { type: "label", label: "My Account" },
        {
          type: "item",
          itemId: "dashboard",
          itemDisplay: "Dashboard",
          itemOnSelect: () => navigate(getRoute("/dashboard")),
        },
        {
          type: "item",
          itemId: "settings",
          itemDisplay: "Settings",
          itemOnSelect: () => navigate(getRoute("/dashboard/settings")),
        },
        { type: "separator" },
        {
          type: "item",
          itemId: "theme",
          itemDisplay: (
            <span class="flex items-center gap-2">
              {theme() === "dark" ? <span>🌙</span> : <span>☀️</span>}
              Toggle Theme
            </span>
          ),
          itemOnSelect: () => toggleTheme(),
          closeOnSelect: false,
        },
        {
          type: "item",
          itemId: "logout",
          itemDisplay: "Logout",
          itemOnSelect: () => {
            logout.run()
            toast.success("Logged out!")
          },
        },
      ]}
    >
      <Avatar class="size-11 border transition active:scale-95">
        <AvatarImage
          src={
            user()?.metadata?.avatar_url
            // ??'https://thicc-uwu.mywaifulist.moe/waifus/satoru-gojo-sorcery-fight/bOnNB0cwHheCCRGzjHLSolqabo41HxX9Wv33kfW7.jpg?class=thumbnail'
          }
        />
        <AvatarFallback>
          {user()
            ?.metadata?.name?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "Me"}
        </AvatarFallback>
      </Avatar>
    </DropdownMenuComp>
  )
}
