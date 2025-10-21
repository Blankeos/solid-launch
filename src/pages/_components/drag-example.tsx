import { For, Index } from "solid-js"
import { createStore, reconcile } from "solid-js/store"
import { TransitionGroup } from "solid-transition-group"
import {
  DragAndDropProvider,
  DraggableItem,
  Droppable,
  useAutoScroll,
} from "@/components/drag-and-drop/drag-and-drop"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils/cn"

const arrayMoveImmutable = <T,>(arr: T[], from: number, to: number): T[] => {
  const newArr = [...arr]
  const [item] = newArr.splice(from, 1)
  newArr.splice(to, 0, item)
  return newArr
}

const PokemonListExample = () => {
  const [list, setList] = createStore([
    {
      id: "001",
      name: "Bulbasaur",
      img: "https://oyster.ignimgs.com/mediawiki/apis.ign.com/pokemon-quest/9/9b/001pq.jpg",
    },
    {
      id: "004",
      name: "Charmander",
      img: "https://img.rankedboost.com/wp-content/uploads/2018/08/Pokemon-Quest-Charmander.png",
    },
    {
      id: "007",
      name: "Squirtle",
      img: "https://img.rankedboost.com/wp-content/uploads/2018/08/Pokemon-Quest-Squirtle.png",
    },
  ])

  return (
    <DragAndDropProvider
      onDrop={({ sourceId, targetId }) => {
        const sourceIndex = list.findIndex((item) => item.id === sourceId)
        const targetIndex = list.findIndex((item) => item.id === targetId)
        if (sourceIndex === -1 || targetIndex === -1) return

        const reorderedItems = arrayMoveImmutable(list, sourceIndex, targetIndex)
        setList(reconcile(reorderedItems))
      }}
    >
      <span class="text-xs">List</span>
      <div class="flex flex-col gap-y-2">
        <TransitionGroup name="group-item">
          <For each={list}>
            {(item) => (
              <DraggableItem id={item.id} data={item}>
                {(dragState, dragRef) => (
                  <div
                    ref={dragRef}
                    class={cn(
                      "flex cursor-grab items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-all active:cursor-grabbing",
                      dragState() === "dragging" && "opacity-50"
                    )}
                  >
                    <img
                      src={item.img}
                      class="h-10 w-10 rounded-full bg-white object-cover object-center"
                      alt={item.name}
                    />
                    <div class="flex-1">
                      <h4 class="font-medium text-foreground">{item.name}</h4>
                      <p class="text-muted-foreground text-xs">ID: {item.id}</p>
                    </div>
                    <div
                      class={`font-medium text-xs ${
                        dragState() === "dragging"
                          ? "text-destructive"
                          : dragState() === "over"
                            ? "text-primary"
                            : "text-muted-foreground"
                      }`}
                    >
                      {dragState() === "dragging"
                        ? "dragging"
                        : dragState() === "over"
                          ? "over"
                          : "idle"}
                    </div>
                  </div>
                )}
              </DraggableItem>
            )}
          </For>
        </TransitionGroup>
      </div>
    </DragAndDropProvider>
  )
}

const SortAsYouDragExample = () => {
  const [list, setList] = createStore([
    { id: "1", name: "Alpha", emoji: "🚀" },
    { id: "2", name: "Beta", emoji: "⭐" },
    { id: "3", name: "Gamma", emoji: "🔥" },
    { id: "4", name: "Delta", emoji: "💎" },
  ])

  return (
    <DragAndDropProvider
      instanceId="sort-list"
      onDropTargetChange={({ sourceId, targetId }) => {
        const sourceIndex = list.findIndex((item) => item.id === sourceId)
        const targetIndex = list.findIndex((item) => item.id === targetId)
        if (sourceIndex === -1 || targetIndex === -1) return

        const reorderedItems = arrayMoveImmutable(list, sourceIndex, targetIndex)
        setList(reconcile(reorderedItems))
      }}
    >
      <span class="text-xs">List (but sort-as-you-drag, idk it looks cooler)</span>
      <div class="flex flex-col gap-y-2">
        <TransitionGroup name="group-item">
          <For each={list}>
            {(item) => (
              <DraggableItem id={item.id} data={item}>
                {(dragState, dragRef) => (
                  <div
                    ref={dragRef}
                    class={cn(
                      "cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-all active:cursor-grabbing",
                      dragState() === "over" && "rotate-2 bg-primary/20",
                      dragState() === "dragging" && "opacity-50"
                    )}
                  >
                    <span class="font-medium">
                      {item.emoji} {item.name}
                    </span>
                  </div>
                )}
              </DraggableItem>
            )}
          </For>
        </TransitionGroup>
      </div>
    </DragAndDropProvider>
  )
}

const FruitGridExample = () => {
  const [grid, setGrid] = createStore([
    { id: "🍎", name: "Apple" },
    { id: "🍊", name: "Orange" },
    { id: "🍇", name: "Grape" },
    { id: "🍌", name: "Banana" },
    { id: "🍓", name: "Strawberry" },
    { id: "🥝", name: "Kiwi" },
  ])

  return (
    <DragAndDropProvider
      instanceId="fruit-grid"
      onDrop={({ sourceId, targetId }) => {
        const sourceIndex = grid.findIndex((item) => item.id === sourceId)
        const targetIndex = grid.findIndex((item) => item.id === targetId)
        if (sourceIndex === -1 || targetIndex === -1) return

        const reorderedItems = arrayMoveImmutable(grid, sourceIndex, targetIndex)
        setGrid(reconcile(reorderedItems))
      }}
    >
      <span class="text-xs">Grid</span>
      <div class="flex flex-col gap-y-2">
        <div class="grid grid-cols-3 gap-2">
          <TransitionGroup name="group-item">
            <For each={grid}>
              {(item) => (
                <DraggableItem id={item.id} data={item}>
                  {(dragState, dragRef) => (
                    <div
                      ref={dragRef}
                      class={cn(
                        "flex cursor-grab flex-col items-center gap-2 rounded-lg border bg-card p-3 shadow-sm transition-all active:cursor-grabbing",
                        dragState() === "dragging" && "opacity-20",
                        dragState() === "over" && "rotate-3"
                      )}
                    >
                      <div class="text-2xl">{item.id}</div>
                      <div class="font-medium text-xs">{item.name}</div>
                    </div>
                  )}
                </DraggableItem>
              )}
            </For>
          </TransitionGroup>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setGrid((items) => [...items].sort(() => Math.random() - 0.5))
          }}
        >
          🔀 Shuffle Fruits
        </Button>
      </div>
    </DragAndDropProvider>
  )
}

const TrelloBoardExample = () => {
  type Task = { id: string; title: string; assignee: string }
  type Column = { columnId: string; title: string; items: Task[] }

  const [board, setBoard] = createStore<Column[]>([
    {
      title: "Todo",
      columnId: "todo",
      items: [
        { id: "t1", title: "Design mockups", assignee: "Alice" },
        { id: "t2", title: "Write API docs", assignee: "Bob" },
        { id: "t3", title: "Review PR #42", assignee: "You" },
        { id: "t4", title: "Update dependencies", assignee: "Carol" },
        { id: "t5", title: "Fix login bug", assignee: "Dave" },
      ],
    },
    {
      title: "Doing",
      columnId: "doing",
      items: [
        { id: "d1", title: "Setup CI pipeline", assignee: "Alice" },
        { id: "d2", title: "Deploy to staging", assignee: "Bob" },
      ],
    },
    {
      title: "Done",
      columnId: "done",
      items: [],
    },
  ])
  const [columnSorting, setColumnSorting] = createStore([
    { id: "todo" },
    { id: "doing" },
    { id: "done" },
  ])

  function moveTask(
    fromColumnIndex: number,
    fromIndex: number,
    toColumnIndex: number,
    toIndex: number
  ) {
    if (fromColumnIndex === toColumnIndex) {
      // Move within the same column
      const column = { ...board[fromColumnIndex] }
      const newItems = arrayMoveImmutable(column.items, fromIndex, toIndex)
      setBoard(fromColumnIndex, "items", reconcile(newItems))
    } else {
      // Move between columns
      const task = board[fromColumnIndex].items[fromIndex]
      setBoard(
        fromColumnIndex,
        "items",
        reconcile(board[fromColumnIndex].items.filter((_, i) => i !== fromIndex))
      )
      setBoard(
        toColumnIndex,
        "items",
        reconcile(
          (() => {
            const next = [...board[toColumnIndex].items]
            next.splice(toIndex, 0, task)
            return next
          })()
        )
      )
    }
  }

  function moveColumn(fromIndex: number, toIndex: number) {
    const reordered = arrayMoveImmutable(columnSorting, fromIndex, toIndex)
    setColumnSorting(reconcile(reordered))
  }

  return (
    <DragAndDropProvider
      instanceId="trello-board"
      onDrop={({ sourceId, targetId, sourceData, targetData }) => {
        // COLUMN MOVE
        const isColumn = sourceData && "column" in sourceData
        if (isColumn) {
          const fromIndex = columnSorting.findIndex((col) => col.id === sourceId)
          const toIndex = columnSorting.findIndex((col) => col.id === targetId)
          if (fromIndex === -1 || toIndex === -1) return
          moveColumn(fromIndex, toIndex)
          return
        }

        // TASK MOVE
        const fromColumnIndex = board.findIndex((col) => col.items.some((t) => t.id === sourceId))
        const toColumnIndex = board.findIndex((col) => col.columnId === targetData?.columnId)
        if (fromColumnIndex === -1 || toColumnIndex === -1) return

        const fromIndex = board[fromColumnIndex].items.findIndex((t) => t.id === sourceId)
        const toIndex = board[toColumnIndex].items.findIndex((t) => t.id === targetId)
        if (fromIndex === -1) return

        const insertIndex = toIndex === -1 ? board[toColumnIndex].items.length : toIndex
        moveTask(fromColumnIndex, fromIndex, toColumnIndex, insertIndex)
      }}
    >
      <span class="text-xs">Trello Board (Cross-list drag & sortable columns)</span>
      <div class="grid grid-cols-3 gap-4">
        <For each={columnSorting}>
          {(column, _columnIndex) => {
            const columnId = column.id
            const col = board.find((_b) => _b.columnId === columnId)!

            return (
              <DraggableItem
                id={columnId}
                data={{ column: true, columnId: columnId }}
                dropTargetCanDrop={(_s) => {
                  return true
                }}
              >
                {(columnState, columnRef) => {
                  const scrollRef = useAutoScroll({
                    canScroll: ({ source }) => {
                      return !("column" in source.data.data)
                    },
                  })

                  return (
                    <div
                      ref={columnRef}
                      class={cn(
                        "flex cursor-grab flex-col gap-2 rounded-lg border border-dashed bg-background transition active:cursor-grabbing",
                        columnState() === "over" && "bg-primary/30",
                        columnState() === "dragging" && "opacity-50"
                      )}
                    >
                      <h4 class="px-3 pt-3 font-semibold text-xs">{col.title}</h4>
                      <div
                        ref={scrollRef}
                        class="scrollbar-thin flex h-full max-h-[190px] flex-col gap-2 overflow-auto px-3 pb-3"
                      >
                        <For each={col.items}>
                          {(task) => (
                            <DraggableItem id={task.id} data={{ ...task, columnId: columnId }}>
                              {(taskState, taskRef) => (
                                <div
                                  ref={taskRef}
                                  class={cn(
                                    "relative flex cursor-grab flex-col gap-1 rounded-lg border bg-card p-3 shadow-sm transition-all active:cursor-grabbing",
                                    taskState() === "over" && "rotate-2",
                                    taskState() === "dragging" && "opacity-50"
                                  )}
                                >
                                  <span class="font-medium text-sm">{task.title}</span>
                                  <span class="text-muted-foreground text-xs">
                                    @{task.assignee}
                                  </span>
                                </div>
                              )}
                            </DraggableItem>
                          )}
                        </For>
                      </div>
                    </div>
                  )
                }}
              </DraggableItem>
            )
          }}
        </For>
      </div>
    </DragAndDropProvider>
  )
}

const TrophyDropExample = () => {
  const [slots, setSlots] = createStore<{ left: string | null; right: string | null }>({
    left: null,
    right: "🏆",
  })

  return (
    <DragAndDropProvider
      instanceId="trophy-drop"
      onDrop={({ sourceId, targetId }) => {
        if (sourceId === "left-slot" && targetId === "right-slot") {
          setSlots("left", null)
          setSlots("right", "🏆")
        } else if (sourceId === "right-slot" && targetId === "left-slot") {
          setSlots("left", "🏆")
          setSlots("right", null)
        }
      }}
    >
      <span class="text-xs">Drag to swap between the two containers</span>
      <div class="flex items-center gap-10">
        <Index each={["left", "right"]}>
          {(side) => (
            <Droppable id={`${side()}-slot`}>
              {(state, ref) => (
                <div
                  ref={ref}
                  class={cn(
                    "flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed bg-background transition",
                    state() === "over" ? "border-primary bg-primary/50" : ""
                  )}
                >
                  {slots[side() as "left" | "right"] ? (
                    <DraggableItem
                      id={`${side()}-slot`}
                      data={{ type: "item", emoji: slots[side() as "left" | "right"] }}
                    >
                      {(dragState, dragRef) => (
                        <div
                          ref={dragRef}
                          class={cn(
                            "animate-fadeIn cursor-grab select-none rounded-lg bg-yellow-200 p-4 text-5xl shadow active:cursor-grabbing",
                            dragState() === "dragging" && "invisible"
                          )}
                        >
                          {slots[side() as "left" | "right"]}
                        </div>
                      )}
                    </DraggableItem>
                  ) : (
                    <span class="text-gray-400">Drop here</span>
                  )}
                </div>
              )}
            </Droppable>
          )}
        </Index>
      </div>
    </DragAndDropProvider>
  )
}

export function DragExample() {
  return (
    <>
      <PokemonListExample />
      <SortAsYouDragExample />
      <FruitGridExample />
      <TrelloBoardExample />
      <TrophyDropExample />
    </>
  )
}
