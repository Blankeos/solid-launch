import type { Table } from "@tanstack/solid-table"
import { For } from "solid-js"

import { IconSettings } from "@/assets/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type TableViewOptionsProps<TData> = {
  table: Table<TData>
}

export function TableViewOptions<TData>(props: TableViewOptionsProps<TData>) {
  return (
    <DropdownMenu placement="bottom-end">
      <DropdownMenuTrigger
        as={Button<"button">}
        variant="outline"
        size="sm"
        class="ml-auto hidden h-8 lg:flex"
      >
        <IconSettings />
        View
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <For
          each={props.table
            .getAllColumns()
            .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())}
        >
          {(column) => (
            <DropdownMenuCheckboxItem
              class="capitalize"
              checked={column.getIsVisible()}
              onChange={(value) => column.toggleVisibility(!!value)}
            >
              {column.id}
            </DropdownMenuCheckboxItem>
          )}
        </For>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
