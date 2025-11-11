import { type FlowProps, Show } from "solid-js"

import { Panel, PanelGroup, ResizeHandle } from "solid-resizable-panels"
import "solid-resizable-panels/styles.css"
import {
  HorizontalLayoutContextProvider,
  PANEL_ID__SIDEBAR,
  useHorizontalLayoutContext,
} from "./horizontal-layout.context"
import HorizontalSidebar from "./horizontal-sidebar"

export default function HorizontalLayout(props: FlowProps) {
  return (
    <HorizontalLayoutContextProvider>
      <_HorizontalLayoutContextProvider>{props.children}</_HorizontalLayoutContextProvider>
    </HorizontalLayoutContextProvider>
  )
}

function _HorizontalLayoutContextProvider(props: FlowProps) {
  const { sidebarState, _setApi, _onCollapse, _onExpand, _onResize } = useHorizontalLayoutContext()

  return (
    <PanelGroup class="flex h-screen max-h-screen w-full overflow-hidden" setAPI={_setApi}>
      <Panel
        minSize={5}
        maxSize={20}
        collapsible
        id={PANEL_ID__SIDEBAR}
        initialSize={sidebarState.lastSize}
        onResize={_onResize}
        onCollapse={_onCollapse}
        onExpand={_onExpand}
      >
        <HorizontalSidebar />
      </Panel>
      <Show when={sidebarState.isOpen}>
        <ResizeHandle class="group relative flex bg-transparent!">
          <div class="h-full w-[1px] bg-sidebar-accent group-active:bg-primary" />
        </ResizeHandle>
      </Show>
      <Panel id="main-content-panel" class="overflow-hidden">
        <main class="flex max-h-screen flex-col overflow-y-auto">{props.children}</main>
      </Panel>
    </PanelGroup>
  )
}
