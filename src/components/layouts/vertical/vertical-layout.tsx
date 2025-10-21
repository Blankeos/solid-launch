import type { FlowProps } from "solid-js"
import VerticalFooter from "./vertical-footer"
import VerticalNav from "./vertical-nav"

export default function VerticalLayout(props: FlowProps) {
  return (
    <div class="flex min-h-screen flex-col">
      <VerticalNav />
      <main class="flex flex-1 flex-col">{props.children}</main>
      <VerticalFooter />
    </div>
  )
}
