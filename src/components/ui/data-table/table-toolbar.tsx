// NOTE: This was heavily edited to support flexible props. Quality of life updates:
// - Pass filterables as a prop - selections. (Used to be hardcoded)
// - Pass searchables as a prop - search input + multiple columns. (Use to be hardcoded and only single column)
// - Pass disableViewOptions as a prop - if I don't want filtering of view options (Used to be hardcoded and always there)
// - Pass additionalJSX as a prop - if I want custom actions int the header.

import type { Table } from "@tanstack/solid-table"
import { type Component, createSignal, For, type JSX, Show } from "solid-js"
import { IconX } from "@/assets/icons"
import { Button } from "@/components/ui/button"
import { TextField, TextFieldInput } from "@/components/ui/text-field"
import { TableFacetedFilter } from "./table-faceted-filter"
import { TableViewOptions } from "./table-view-options"

export type DataTableToolbarFilterableOptions = {
  column: string
  title: string
  options: Array<{ label: string; value: string; icon?: Component }>
}[]

export type DataTableToolbarOptions = {
  filterables?: DataTableToolbarFilterableOptions
  searchable?: {
    columns: string | string[]
    placeholder: string
    class?: string
  }
  disableViewOptions?: boolean
  additionalJSX?: () => JSX.Element
}

export type DataTableToolbarProps<TData> = {
  table: Table<TData>
} & DataTableToolbarOptions

export function TableToolbar<TData>(props: DataTableToolbarProps<TData>) {
  const [searchValue, setSearchValue] = createSignal("")

  const isFiltered = () => props.table.getState().columnFilters.length > 0

  const handleSearch = (value: string) => {
    setSearchValue(value)
    const columns = Array.isArray(props.searchable?.columns)
      ? props.searchable.columns
      : ([props.searchable?.columns].filter(Boolean) as string[])

    columns.forEach((col) => {
      const column = props.table.getColumn(col)
      if (column) {
        column.setFilterValue(value)
      }
    })
  }

  return (
    <div class="flex items-center justify-between">
      <div class="flex flex-1 items-center space-x-2">
        {props.searchable && (
          <TextField value={searchValue()} onChange={handleSearch}>
            <TextFieldInput
              placeholder={props.searchable.placeholder}
              class={props.searchable.class ?? "h-8 w-[150px] lg:w-[250px]"}
            />
          </TextField>
        )}

        <For each={props.filterables}>
          {(f) =>
            props.table.getColumn(f.column) ? (
              <TableFacetedFilter
                column={props.table.getColumn(f.column)}
                title={f.title}
                options={f.options}
              />
            ) : null
          }
        </For>

        {isFiltered() && (
          <Button
            variant="ghost"
            onClick={() => {
              props.table.resetColumnFilters()
              setSearchValue("")
            }}
            class="h-8 px-2 lg:px-3"
          >
            Reset
            <IconX />
          </Button>
        )}
      </div>
      <Show when={!props.disableViewOptions}>
        <TableViewOptions table={props.table} />
      </Show>
      {props.additionalJSX?.()}
    </div>
  )
}
