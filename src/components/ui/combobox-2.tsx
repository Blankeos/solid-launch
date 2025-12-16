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
  label: string | JSX.Element
}

export interface Combobox2CommandProps extends ComponentProps<typeof Command> {
  items: ComboboxItem[]
  selectedValue: string
  onSelectedValueChange: (value: string | string[]) => void
  searchPlaceholder?: string
  onClose?: () => void
  disallowEmptySelection?: boolean
  multiple?: boolean
}

export const Combobox2Command: Component<Combobox2CommandProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "items",
    "selectedValue",
    "onSelectedValueChange",
    "searchPlaceholder",
    "onClose",
    "disallowEmptySelection",
    "multiple",
  ])

  const [internalSelectedValue, setInternalSelectedValue] = createSignal(local.selectedValue || "")

  const currentSelectedValue = () =>
    local.selectedValue !== undefined ? local.selectedValue : internalSelectedValue()

  const handleValueChange = (value: string) => {
    if (local.multiple) {
      // For multiple selection, treat selectedValue as a comma-separated string
      const currentValues = currentSelectedValue() ? currentSelectedValue().split(",") : []
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value]

      const newValueString = newValues.join(",")

      if (local.onSelectedValueChange) {
        local.onSelectedValueChange(newValues)
      } else {
        setInternalSelectedValue(newValueString)
      }
    } else {
      // Single selection logic
      const newValue =
        currentSelectedValue() === value && !local.disallowEmptySelection ? "" : value
      if (local.onSelectedValueChange) {
        local.onSelectedValueChange(newValue)
      } else {
        setInternalSelectedValue(newValue)
      }

      local.onClose?.()
    }
  }

  const isItemSelected = (value: string) => {
    if (local.multiple) {
      const currentValues = currentSelectedValue() ? currentSelectedValue().split(",") : []
      return currentValues.includes(value)
    } else {
      return currentSelectedValue() === value
    }
  }

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
                  handleValueChange(value)
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
                    isItemSelected(item.value) ? "opacity-100" : "opacity-0"
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
  onValueChange?: (value: string | string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  triggerClass?: string
  contentClass?: string
  disabled?: boolean
  children?: JSX.Element
  disallowEmptySelection?: boolean
  multiple?: boolean
}

/** Lots of edge cases right now but good for 70% of usecases. */
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
    "multiple",
  ])
  const [open, setOpen] = createSignal(false)
  const [internalValue, setInternalValue] = createSignal(local.value || "")

  // Update internal value when prop changes
  const selectedValue = () => (local.value !== undefined ? local.value : internalValue())

  const handleValueChange = (value: string | string[]) => {
    const newValue = Array.isArray(value) ? value.join(",") : value
    setInternalValue(newValue)
    local.onValueChange?.(value)
  }

  const getDisplayText = () => {
    const currentValue = selectedValue()
    if (!currentValue) return local.placeholder ?? "Select item..."

    if (local.multiple && currentValue) {
      const selectedValues = currentValue.split(",")
      const selectedItems = local.items.filter((item) => selectedValues.includes(item.value))

      // Create an array of labels, with string labels separated by ", "
      const labels = selectedItems.map((item, index) => {
        if (typeof item.label === "string") {
          // Add comma separator for string labels (except the last one)
          return index === selectedItems.length - 1 ? item.label : `${item.label}, `
        }
        // For JSX elements, wrap them with a span and add comma if not the last item
        return (
          <span>
            {item.label}
            {index < selectedItems.length - 1 && ", "}
          </span>
        )
      })

      // Return the array of labels (mixed string/JSX)
      return labels
    } else {
      const foundItem = local.items.find((item) => item.value === currentValue)
      return foundItem?.label
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
        <span class="text-start">
          <Show when={selectedValue()} fallback={local.placeholder ?? "Select item..."}>
            {getDisplayText()}
          </Show>
        </span>
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
          selectedValue={selectedValue()}
          onSelectedValueChange={handleValueChange}
          searchPlaceholder={local.searchPlaceholder}
          onClose={() => setOpen(false)}
          disallowEmptySelection={local.disallowEmptySelection}
          multiple={local.multiple}
        />
      </PopoverContent>
    </Popover>
  )
}
