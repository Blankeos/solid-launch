import { useIntersection } from "bagon-hooks"
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  Match,
  on,
  Show,
  Switch,
  type VoidProps,
} from "solid-js"
import { IconLoading } from "@/assets/icons"
import { cn } from "@/utils/cn"

// ===========================================================================
// HOOK
// ===========================================================================
interface UseScrollPaginationOptions {
  onLoadMore: () => void
  isLoading: boolean
  hasMore: boolean
  threshold?: number
}

export type ScrollPaginationState = "idle" | "loading" | "end"

export function useScrollPagination(params: Accessor<UseScrollPaginationOptions>) {
  const [_containerRef, setContainerRef] = createSignal<HTMLElement>()
  const { ref, entry } = useIntersection({
    root: _containerRef(),
    threshold: params().threshold ?? 0.75,
  })

  createEffect(
    // Strictly only trigger on intersection. Very hard bug I encountered was changes in isLoading/hasMore are triggering onLoadMore no matter what.
    on([entry], () => {
      const el = entry()
      if (el?.isIntersecting && !params().isLoading && params().hasMore) {
        params().onLoadMore()
      }
    })
  )

  const loadTriggerState = createMemo(() => {
    if (params().isLoading) return "loading"
    if (!params().hasMore) return "end"
    return "idle"
  })

  return {
    /** No need to assign since it's viewport by default. */
    scrollContainerRef: setContainerRef,
    loadTriggerRef: ref,
    loadTriggerState,
    /** For debugging */
    _entry: entry,
  }
}

// ===========================================================================
// COMPONENT
// ===========================================================================

interface ScrollPaginationObserverProps {
  ref: (element: any) => void
  state: Accessor<ScrollPaginationState>
  class?: string
}
/**
 * Usage: (Recommended TanStack)
 *
 * const { loadTriggerRef, loadTriggerState } = useScrollPagination({
 *   onLoadMore: () => infiniteQuery.fetchNextPage()
 *   hasMore: infiniteQuery.hasNextPage,
 *   isLoading: infiniteQuery.isLoading
 * })
 *
 * <ScrollPaginationObserver ref={loadTriggerRef} state={loadTriggerState} />
 */
export function ScrollPaginationObserver(props: VoidProps<ScrollPaginationObserverProps>) {
  return (
    <div
      class={cn("flex h-20 items-center justify-center text-gray-500", props.class)}
      ref={props.ref}
    >
      <Show when={props.state() !== "idle"}>
        <Switch>
          <Match when={props.state() === "loading"}>
            <IconLoading class="size-8" />
          </Match>
          <Match when={props.state() === "end"}>You've reached the end.</Match>
        </Switch>
      </Show>
    </div>
  )
}
