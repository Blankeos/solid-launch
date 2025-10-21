// Purely for state management of the sidebars.

import { useHotkeys, useLocalStorageStore } from "bagon-hooks"
import {
  createContext,
  createEffect,
  createSignal,
  type FlowComponent,
  type Setter,
  useContext,
} from "solid-js"
import type { PanelGroupAPI } from "solid-resizable-panels"
import { debounce } from "@/utils/debounce"

// ===========================================================================
// Configurations
// ===========================================================================
export const DEFAULT_EXPAND_SIZE = 30
export const PANEL_ID__SIDEBAR = "panel__sidebar"

// ===========================================================================
// Context
// ===========================================================================

export type HorizontalLayoutContextValue = {
  sidebarState: {
    isOpen: boolean
    lastSize: number
  }
  open: () => void
  close: () => void

  // Prefixed w/ '_': For setup only (in the layout)
  _setApi: Setter<PanelGroupAPI | undefined>
  _onResize: (value: number) => void
  _onCollapse: () => void
  _onExpand: () => void
}

const HorizontalLayoutContext = createContext({} as HorizontalLayoutContextValue)

// ===========================================================================
// Hook
// ===========================================================================
/** Can be more aptly named useSidebar, but this is more flexible in case of 3-panel horizontal layouts. */
export const useHorizontalLayoutContext = () => useContext(HorizontalLayoutContext)

// ===========================================================================
// Provider
// ===========================================================================
export const HorizontalLayoutContextProvider: FlowComponent = (props) => {
  const [api, setApi] = createSignal<PanelGroupAPI | undefined>()

  const [sidebarState, setSidebarState] = useLocalStorageStore({
    key: "sidenav-state",
    defaultValue: {
      isOpen: true,
      lastSize: DEFAULT_EXPAND_SIZE,
    },
  })

  // We debounce it to 5ms to address "SPECIAL BUG" so the weird minwidth resize on collapse does
  // not get counted as a resize.
  const onResize = debounce((value: number) => {
    if (value === 0) return
    setSidebarState("lastSize", value)
  }, 5) // Debounce for 5ms

  function onCollapse() {
    setSidebarState("isOpen", false)
  }

  function onExpand() {
    setSidebarState("isOpen", true)
  }

  function open() {
    if (!api()) return

    setSidebarState("isOpen", true)
    api()!.expand(PANEL_ID__SIDEBAR, sidebarState.lastSize)
  }

  function close() {
    if (!api()) return

    setSidebarState("isOpen", false)
    api()!.collapse(PANEL_ID__SIDEBAR)
    // WEIRD BUG: For some reason it sometimes fails to collapse to 0, it just goes to min size.
    // Calling collapse again will make it 0 in that same frame.
    if (sidebarState.lastSize !== 0) api()!.collapse(PANEL_ID__SIDEBAR)
  }

  useHotkeys([
    [
      "meta+b",
      () => {
        if (sidebarState.isOpen) {
          close()
        } else {
          open()
        }
      },
    ],
  ])

  let hasMounted = false
  createEffect(() => {
    if (hasMounted) return
    if (!api()) return

    if (!sidebarState.isOpen) close()

    hasMounted = true
  })

  return (
    <HorizontalLayoutContext.Provider
      value={{
        sidebarState,
        open,
        close,
        _setApi: setApi,
        _onCollapse: onCollapse,
        _onExpand: onExpand,
        _onResize: onResize,
      }}
    >
      {props.children}
    </HorizontalLayoutContext.Provider>
  )
}
