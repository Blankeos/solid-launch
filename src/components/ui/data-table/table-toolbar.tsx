// NOTE: This was heavily edited to support flexible props. Quality of life updates:
// - Pass filterables as a prop - selections. (Used to be hardcoded)
// - Pass searchables as a prop - search input + multiple columns. (Use to be hardcoded and only single column)

import type { Table } from "@tanstack/solid-table"
import { type Component, createSignal, For, onCleanup, onMount } from "solid-js"
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
    /** @defaultValue AND (OR is currently broken, so string[] columns doesn't work) */
    filterMode?: "OR" | "AND"
  }
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

    const filterMode = props.searchable?.filterMode ?? "AND"

    if (filterMode === "OR" && value) {
      // For OR mode, we apply the filter function to each column individually
      // TanStack Table expects column filters to be applied per-column
      columns.forEach((col) => {
        const column = props.table.getColumn(col)
        if (column) {
          column.setFilterValue((rowValue: any) => {
            const cellValue = String(rowValue ?? "").toLowerCase()
            return cellValue.includes(value.toLowerCase())
          })
        }
      })
    } else {
      columns.forEach((col) => {
        const column = props.table.getColumn(col)
        if (column) {
          column.setFilterValue(value)
        }
      })
    }
  }

  onMount(() => {
    onCleanup(() => {
      const columns = Array.isArray(props.searchable?.columns)
        ? props.searchable.columns
        : ([props.searchable?.columns].filter(Boolean) as string[])

      // clear all filters set by OR logic as well
      const orFilterCol = props.table.getColumn("__global__")
      if (orFilterCol) {
        orFilterCol.setFilterValue(undefined)
      }

      columns.forEach((col) => {
        const column = props.table.getColumn(col)
        if (column) {
          column.setFilterValue(undefined)
        }
      })
    })
  })

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
              // also clear OR filter on reset
              const orFilterCol = props.table.getColumn("__global__")
              if (orFilterCol) {
                orFilterCol.setFilterValue(undefined)
              }

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
      <TableViewOptions table={props.table} />
    </div>
  )
}
