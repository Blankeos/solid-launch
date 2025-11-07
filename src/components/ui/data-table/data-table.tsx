// A bit edited, mainly the integration with DataTableToolbarOptions.
// Quality of life updates:
// - Disable the toolbar when I want to.
// - Disable pagination when I want to.

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/solid-table"
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/solid-table"
import { createSignal, For, Show } from "solid-js"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"

import { TablePagination } from "./table-pagination"
import { type DataTableToolbarOptions, TableToolbar } from "./table-toolbar"

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  toolbar?: DataTableToolbarOptions & { disabled?: boolean }
  pagination?: { disabled?: boolean }
}

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = createSignal({})
  const [columnVisibility, setColumnVisibility] = createSignal<VisibilityState>({})
  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>([])
  const [sorting, setSorting] = createSignal<SortingState>([])

  const table = createSolidTable({
    get data() {
      return props.data
    },
    get columns() {
      return props.columns
    },
    state: {
      get sorting() {
        return sorting()
      },
      get columnVisibility() {
        return columnVisibility()
      },
      get rowSelection() {
        return rowSelection()
      },
      get columnFilters() {
        return columnFilters()
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div class="space-y-4">
      <Show when={!props.toolbar?.disabled}>
        <TableToolbar
          table={table}
          filterables={props.toolbar?.filterables}
          searchable={props.toolbar?.searchable}
          disableViewOptions={props.toolbar?.disableViewOptions}
          additionalJSX={props.toolbar?.additionalJSX}
        />
      </Show>
      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <For each={table.getHeaderGroups()}>
              {(headerGroup) => (
                <TableRow>
                  <For each={headerGroup.headers}>
                    {(header) => (
                      <TableHead colSpan={header.colSpan}>
                        <Show when={!header.isPlaceholder}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </Show>
                      </TableHead>
                    )}
                  </For>
                </TableRow>
              )}
            </For>
          </TableHeader>
          <TableBody>
            <Show
              when={table.getRowModel().rows?.length}
              fallback={
                <TableRow>
                  <TableCell colSpan={props.columns.length} class="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              }
            >
              <For each={table.getRowModel().rows}>
                {(row) => (
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    <For each={row.getVisibleCells()}>
                      {(cell) => (
                        <TableCell>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )}
                    </For>
                  </TableRow>
                )}
              </For>
            </Show>
          </TableBody>
        </Table>
      </div>
      <Show when={!props.pagination?.disabled}>
        <TablePagination table={table} />
      </Show>
    </div>
  )
}
