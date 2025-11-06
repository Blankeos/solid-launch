import { useInfiniteQuery, useQueryClient } from "@tanstack/solid-query"
import { For } from "solid-js"
import {
  ScrollPaginationObserver,
  useScrollPagination,
} from "@/components/scroll-pagination-observer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock async fetcher that returns a page of items
const all = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
}))
const fetchPage = async (page: number) => {
  await new Promise((r) => setTimeout(r, 1000)) // simulate network delay
  const limit = 3 // default from paginationDTO
  const start = (page - 1) * limit // pages start at 1
  const items = all.slice(start, start + limit)
  return {
    items,
    hasMore: start + limit < all.length,
    total: all.length,
    page,
    limit,
  }
}

export function ScrollPaginationExample() {
  const queryClient = useQueryClient()

  const infiniteQuery = useInfiniteQuery(() => ({
    queryKey: ["scroll-pagination-items"],
    queryFn: async ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined
    },
  }))
  const { scrollContainerRef, loadTriggerRef, loadTriggerState, _entry } = useScrollPagination(
    () => ({
      onLoadMore: () => infiniteQuery.fetchNextPage(),
      isLoading: infiniteQuery.isFetching,
      hasMore: infiniteQuery.hasNextPage,
    })
  )

  // flatten pages into one list
  const items = () => infiniteQuery.data?.pages.flatMap((p) => p.items) ?? []

  const handleReset = () => {
    queryClient.resetQueries({ queryKey: ["scroll-pagination-items"] })
  }

  return (
    <div class="w-72 p-6">
      <Badge variant={_entry()?.isIntersecting ? "success" : "info"}>
        {_entry()?.isIntersecting ? "Intersecting" : "Idle"}
      </Badge>
      <div class="mb-4 flex items-center justify-between gap-5 text-xs">
        <h2 class="">Items ({items().length}/ 20)</h2>
        <Button onClick={handleReset} variant="ghost" size="sm">
          Reset
        </Button>
      </div>

      <div class="h-full max-h-[400px] overflow-y-auto" ref={scrollContainerRef}>
        <ul class="space-y-2">
          <For each={items()}>
            {(item) => <li class="rounded border p-3 shadow-sm">{item.title}</li>}
          </For>
        </ul>

        <ScrollPaginationObserver ref={loadTriggerRef} state={loadTriggerState} />
      </div>
    </div>
  )
}
