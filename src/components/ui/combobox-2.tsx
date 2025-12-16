import {
  type Component,
  type ComponentProps,
  createSignal,
  For,
  type JSX,
  Show,
  splitProps,
} from "solid-js"
import { cn } from "@/utils/cn"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export interface ComboboxItem {
  value: string
  label: string
}

export interface Combobox2CommandProps extends ComponentProps<typeof Command> {
  items: ComboboxItem[]
  value: string
  onValueChange: (value: string) => void
  searchPlaceholder?: string
  onClose?: () => void
}

export const Combobox2Command: Component<Combobox2CommandProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "items",
    "value",
    "onValueChange",
    "searchPlaceholder",
    "onClose",
  ])

  return (
    <Command {...rest}>
      <CommandInput placeholder={local.searchPlaceholder ?? "Search..."} />
      <CommandList>
        <CommandEmpty>No item found.</CommandEmpty>
        <CommandGroup>
          <For each={local.items}>
            {(item) => (
              <CommandItem
                value={item.value}
                onSelect={(value) => {
                  local.onValueChange(value)
                  local.onClose?.()
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class={cn(
                    "mr-2 h-4 w-4",
                    local.value === item.value ? "opacity-100" : "opacity-0"
                  )}
                >
                  <path d="M5 12l5 5l10 -10" />
                </svg>
                {item.label}
              </CommandItem>
            )}
          </For>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

/** sameWidth is true by default (normally it's not) */
export interface Combobox2CompProps extends ComponentProps<typeof Popover> {
  items: ComboboxItem[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  triggerClass?: string
  contentClass?: string
  disabled?: boolean
  children?: JSX.Element
  disallowEmptySelection?: boolean
}

export const Combobox2Comp: Component<Combobox2CompProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "items",
    "value",
    "onValueChange",
    "placeholder",
    "searchPlaceholder",
    "triggerClass",
    "contentClass",
    "disabled",
    "children",
    "sameWidth",
    "disallowEmptySelection",
  ])
  const [open, setOpen] = createSignal(false)
  const [internalValue, setInternalValue] = createSignal(local.value || "")

  const currentValue = () => (local.value !== undefined ? local.value : internalValue())

  const handleValueChange = (value: string) => {
    // Toggle: if the same value is selected again, clear it
    const newValue = currentValue() === value && !local.disallowEmptySelection ? "" : value
    if (local.onValueChange) {
      local.onValueChange(newValue)
    } else {
      setInternalValue(newValue)
    }
  }

  return (
    <Popover open={open()} onOpenChange={setOpen} sameWidth={local.sameWidth ?? true} {...rest}>
      <PopoverTrigger
        as="button"
        class={cn(
          "flex items-center justify-between rounded-md border border-input bg-background px-4 py-2 font-medium text-foreground text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          local.triggerClass
        )}
        aria-expanded={open()}
        disabled={local.disabled}
      >
        <Show when={currentValue()} fallback={local.placeholder ?? "Select item..."}>
          {local.items.find((item) => item.value === currentValue())?.label}
        </Show>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-4 opacity-50"
        >
          <path d="M8 9l4 -4l4 4" />
          <path d="M16 15l-4 4l-4 -4" />
        </svg>
      </PopoverTrigger>
      <PopoverContent
        class={cn("p-0", local.contentClass)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false)
            e.stopPropagation()
          }
        }}
      >
        <Combobox2Command
          items={local.items}
          value={currentValue()}
          onValueChange={handleValueChange}
          searchPlaceholder={local.searchPlaceholder}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}
