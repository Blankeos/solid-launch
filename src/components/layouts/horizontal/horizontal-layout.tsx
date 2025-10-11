import { FlowProps, Show } from 'solid-js'

import { Panel, PanelGroup, ResizeHandle } from 'solid-resizable-panels'
import 'solid-resizable-panels/styles.css'
import {
  HorizontalLayoutContextProvider,
  PANEL_ID__SIDEBAR,
  useHorizontalLayoutContext,
} from './horizontal-layout.context'
import HorizontalSidebar from './horizontal-sidebar'

interface HorizontalLayoutProps {}
export default function HorizontalLayout(props: FlowProps<HorizontalLayoutProps>) {
  return (
    <HorizontalLayoutContextProvider>
      <_HorizontalLayoutContextProvider>{props.children}</_HorizontalLayoutContextProvider>
    </HorizontalLayoutContextProvider>
  )
}

function _HorizontalLayoutContextProvider(props: FlowProps) {
  const { sidebarState, _setApi, _onCollapse, _onExpand, _onResize } = useHorizontalLayoutContext()

  return (
    <PanelGroup class="bg-background flex h-screen w-full overflow-hidden" setAPI={_setApi}>
      <Panel
        // minSize={10}
        // maxSize={50}
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
          <div class="group-active:bg-primary bg-sidebar-ring h-full w-[1px]" />
        </ResizeHandle>
      </Show>
      <Panel id="main-content-panel">
        <main class="flex max-h-screen flex-grow flex-col overflow-auto">{props.children}</main>
      </Panel>
    </PanelGroup>
  )
}
