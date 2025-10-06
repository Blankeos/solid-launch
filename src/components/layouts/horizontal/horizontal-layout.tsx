import { FlowProps } from 'solid-js'
import HorizontalSidebar from './horizontal-sidebar'

type HorizontalLayoutProps = {}

export default function HorizontalLayout(props: FlowProps<HorizontalLayoutProps>) {
  return (
    <div class="flex h-screen">
      <HorizontalSidebar />
      <main class="grow px-5">{props.children}</main>
    </div>
  )
}
