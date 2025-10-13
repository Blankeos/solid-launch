import { children, Show, splitProps } from 'solid-js'

import { DatePicker as DatePickerPrimitive } from '@ark-ui/solid'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/utils/cn'

const DatePicker = DatePickerPrimitive.Root
const DatePickerLabel = DatePickerPrimitive.Label
const DatePickerContext = DatePickerPrimitive.Context
const DatePickerTableHead = DatePickerPrimitive.TableHead
const DatePickerTableBody = DatePickerPrimitive.TableBody
const DatePickerYearSelect = DatePickerPrimitive.YearSelect
const DatePickerMonthSelect = DatePickerPrimitive.MonthSelect
const DatePickerPositioner = DatePickerPrimitive.Positioner

const DatePickerControl = (props: DatePickerPrimitive.ControlProps) => {
  const [local, others] = splitProps(props, ['class'])
  return (
    <DatePickerPrimitive.Control
      class={cn('inline-flex items-center gap-1', local.class)}
      {...others}
    />
  )
}

const DatePickerInput = (props: DatePickerPrimitive.InputProps) => {
  const [local, others] = splitProps(props, ['class'])
  return (
    <DatePickerPrimitive.Input
      class={cn(
        'border-border bg-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-shadow focus-visible:ring-[1.5px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        local.class
      )}
      {...others}
    />
  )
}

const DatePickerTrigger = (props: DatePickerPrimitive.TriggerProps) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  // prevents rendering children twice
  const resolvedChildren = children(() => local.children)
  const hasChildren = () => resolvedChildren.toArray().length !== 0

  return (
    <DatePickerPrimitive.Trigger
      class={cn(
        'border-border bg-background hover:bg-accent/50 focus-visible:ring-ring flex min-h-9 min-w-9 items-center justify-center rounded-md border transition-[box-shadow,background-color] focus-visible:ring-[1.5px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:size-4',
        local.class
      )}
      {...others}
    >
      <Show when={!hasChildren()} fallback={resolvedChildren()}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-4"
        >
          <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" />
          <path d="M16 3v4" />
          <path d="M8 3v4" />
          <path d="M4 11h16" />
          <path d="M11 15h1" />
          <path d="M12 15v3" />
          <title>Calendar</title>
        </svg>
      </Show>
    </DatePickerPrimitive.Trigger>
  )
}

const DatePickerContent = (props: DatePickerPrimitive.ContentProps) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  return (
    <DatePickerPrimitive.Content
      class={cn(
        'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 rounded-md border p-3 shadow-md outline-none',
        local.class
      )}
      {...others}
    >
      {local.children}
    </DatePickerPrimitive.Content>
  )
}

const DatePickerView = (props: DatePickerPrimitive.ViewProps) => {
  const [local, others] = splitProps(props, ['class'])
  return <DatePickerPrimitive.View class={cn('space-y-4', local.class)} {...others} />
}

const DatePickerViewControl = (props: DatePickerPrimitive.ViewControlProps) => {
  const [local, others] = splitProps(props, ['class'])
  return (
    <DatePickerPrimitive.ViewControl
      class={cn('flex items-center justify-between gap-4', local.class)}
      {...others}
    />
  )
}

const DatePickerPrevTrigger = (props: DatePickerPrimitive.PrevTriggerProps) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  // prevents rendering children twice
  const resolvedChildren = children(() => local.children)
  const hasChildren = () => resolvedChildren.toArray().length !== 0

  return (
    <DatePickerPrimitive.PrevTrigger
      class={cn(
        buttonVariants({
          variant: 'outline',
        }),
        'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        local.class
      )}
      {...others}
    >
      <Show when={!hasChildren()} fallback={resolvedChildren()}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-4"
        >
          <path d="M15 6l-6 6l6 6" />
          <title>Previous</title>
        </svg>
      </Show>
    </DatePickerPrimitive.PrevTrigger>
  )
}

const DatePickerNextTrigger = (props: DatePickerPrimitive.NextTriggerProps) => {
  const [local, others] = splitProps(props, ['class', 'children'])

  // prevents rendering children twice
  const resolvedChildren = children(() => local.children)
  const hasChildren = () => resolvedChildren.toArray().length !== 0

  return (
    <DatePickerPrimitive.NextTrigger
      class={cn(
        buttonVariants({
          variant: 'outline',
        }),
        'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        local.class
      )}
      {...others}
    >
      <Show when={!hasChildren()} fallback={resolvedChildren()}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-4"
        >
          <path d="M9 6l6 6l-6 6" />
          <title>Next</title>
        </svg>
      </Show>
    </DatePickerPrimitive.NextTrigger>
  )
}

const DatePickerViewTrigger = (props: DatePickerPrimitive.ViewTriggerProps) => {
  const [local, others] = splitProps(props, ['class'])
  return (
    <DatePickerPrimitive.ViewTrigger
      class={cn(buttonVariants({ variant: 'ghost' }), 'h-7', local.class)}
      {...others}
    />
  )
}

const DatePickerRangeText = (props: DatePickerPrimitive.RangeTextProps) => {
  const [local, others] = splitProps(props, ['class'])
  return (
    <DatePickerPrimitive.RangeText class={cn('text-sm font-medium', local.class)} {...others} />
  )
}

const DatePickerTable = (props: DatePickerPrimitive.TableProps) => {
  const [local, others] = splitProps(props, ['class'])
  return (
    <DatePickerPrimitive.Table
      class={cn('w-full border-collapse space-y-1', local.class)}
      {...others}
    />
  )
}

const DatePickerTableRow = (props: DatePickerPrimitive.TableRowProps) => {
  const [local, others] = splitProps(props, ['class'])
  return <DatePickerPrimitive.TableRow class={cn('mt-2 flex w-full', local.class)} {...others} />
}

const DatePickerTableHeader = (props: DatePickerPrimitive.TableHeaderProps) => {
  const [local, others] = splitProps(props, ['class'])
  return (
    <DatePickerPrimitive.TableHeader
      class={cn('text-muted-foreground w-8 flex-1 text-[0.8rem] font-normal', local.class)}
      {...others}
    />
  )
}

const DatePickerTableCell = (props: DatePickerPrimitive.TableCellProps) => {
  const [local, others] = splitProps(props, ['class'])
  return (
    <DatePickerPrimitive.TableCell
      class={cn(
        'has-[[data-in-range]]:bg-accent has-[[data-in-range]]:text-accent-foreground has-[[data-outside-range][data-in-range]]:bg-accent/50 flex-1 p-0 text-center text-sm has-[[data-in-range]]:first-of-type:rounded-l-md has-[[data-in-range]]:last-of-type:rounded-r-md has-[[data-range-end]]:rounded-r-md has-[[data-range-start]]:rounded-l-md',
        local.class
      )}
      {...others}
    />
  )
}

const DatePickerTableCellTrigger = (props: DatePickerPrimitive.TableCellTriggerProps) => {
  const [local, others] = splitProps(props, ['class'])
  return (
    <DatePickerPrimitive.TableCellTrigger
      class={cn(
        buttonVariants({ variant: 'ghost' }),
        'size-8 w-full p-0 font-normal data-[selected]:opacity-100',
        'data-[today]:bg-accent data-[today]:text-accent-foreground',
        '[&:is([data-today][data-selected])]:bg-primary [&:is([data-today][data-selected])]:text-primary-foreground',
        'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground',
        'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
        'data-[outside-range]:text-muted-foreground data-[outside-range]:opacity-50',
        '[&:is([data-outside-range][data-in-range])]:bg-accent/50 [&:is([data-outside-range][data-in-range])]:text-muted-foreground [&:is([data-outside-range][data-in-range])]:opacity-30',
        local.class
      )}
      {...others}
    />
  )
}

export {
  DatePicker,
  DatePickerContent,
  DatePickerContext,
  DatePickerControl,
  DatePickerInput,
  DatePickerLabel,
  DatePickerMonthSelect,
  DatePickerNextTrigger,
  DatePickerPositioner,
  DatePickerPrevTrigger,
  DatePickerRangeText,
  DatePickerTable,
  DatePickerTableBody,
  DatePickerTableCell,
  DatePickerTableCellTrigger,
  DatePickerTableHead,
  DatePickerTableHeader,
  DatePickerTableRow,
  DatePickerTrigger,
  DatePickerView,
  DatePickerViewControl,
  DatePickerViewTrigger,
  DatePickerYearSelect,
}
