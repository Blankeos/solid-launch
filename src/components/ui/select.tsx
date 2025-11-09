import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import * as SelectPrimitive from "@kobalte/core/select"
import { cva } from "class-variance-authority"
import { children, For, onMount, splitProps, type ValidComponent } from "solid-js"
import type { JSX } from "solid-js/jsx-runtime"
import { cn } from "@/utils/cn"

const Select = SelectPrimitive.Root
const SelectValue = SelectPrimitive.Value
const SelectHiddenSelect = SelectPrimitive.HiddenSelect

type SelectTriggerProps<T extends ValidComponent = "button"> =
  SelectPrimitive.SelectTriggerProps<T> & {
    class?: string | undefined
    children?: JSX.Element
    loading?: boolean
  }

const SelectTrigger = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, SelectTriggerProps<T>>
) => {
  const [local, others] = splitProps(props as SelectTriggerProps, ["class", "children", "loading"])
  return (
    <SelectPrimitive.Trigger
      class={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        local.class
      )}
      {...others}
    >
      {local.children}

      <Show
        when={local.loading}
        fallback={
          <SelectPrimitive.Icon
            as="svg"
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
          </SelectPrimitive.Icon>
        }
      >
        <IconLoading class="size-4 shrink-0" />
      </Show>
    </SelectPrimitive.Trigger>
  )
}

type SelectContentProps<T extends ValidComponent = "div"> =
  SelectPrimitive.SelectContentProps<T> & { class?: string | undefined }

const SelectContent = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, SelectContentProps<T>>
) => {
  const [local, others] = splitProps(props as SelectContentProps, ["class"])
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        class={cn(
          "fade-in-80 relative z-50 min-w-32 animate-flyUpAndScaleExit overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-expanded:animate-flyUpAndScale",
          local.class
        )}
        {...others}
      >
        <SelectPrimitive.Listbox class="m-0 p-1" />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

type SelectItemProps<T extends ValidComponent = "li"> = SelectPrimitive.SelectItemProps<T> & {
  class?: string | undefined
  children?: JSX.Element
}

const SelectItem = <T extends ValidComponent = "li">(
  props: PolymorphicProps<T, SelectItemProps<T>>
) => {
  const [local, others] = splitProps(props as SelectItemProps, ["class", "children"])
  return (
    <SelectPrimitive.Item
      class={cn(
        "relative mt-0 flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        local.class
      )}
      {...others}
    >
      <SelectPrimitive.ItemIndicator class="absolute right-2 flex size-3.5 items-center justify-center">
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
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M5 12l5 5l10 -10" />
        </svg>
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemLabel>{local.children}</SelectPrimitive.ItemLabel>
    </SelectPrimitive.Item>
  )
}

const labelVariants = cva(
  "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        label: "data-[invalid]:text-destructive",
        description: "font-normal text-muted-foreground",
        error: "text-destructive text-xs",
      },
    },
    defaultVariants: {
      variant: "label",
    },
  }
)

type SelectLabelProps<T extends ValidComponent = "label"> = SelectPrimitive.SelectLabelProps<T> & {
  class?: string | undefined
}

const SelectLabel = <T extends ValidComponent = "label">(
  props: PolymorphicProps<T, SelectLabelProps<T>>
) => {
  const [local, others] = splitProps(props as SelectLabelProps, ["class"])
  return <SelectPrimitive.Label class={cn(labelVariants(), local.class)} {...others} />
}

type SelectDescriptionProps<T extends ValidComponent = "div"> =
  SelectPrimitive.SelectDescriptionProps<T> & {
    class?: string | undefined
  }

const SelectDescription = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, SelectDescriptionProps<T>>
) => {
  const [local, others] = splitProps(props as SelectDescriptionProps, ["class"])
  return (
    <SelectPrimitive.Description
      class={cn(labelVariants({ variant: "description" }), local.class)}
      {...others}
    />
  )
}

type SelectErrorMessageProps<T extends ValidComponent = "div"> =
  SelectPrimitive.SelectErrorMessageProps<T> & {
    class?: string | undefined
  }

const SelectErrorMessage = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, SelectErrorMessageProps<T>>
) => {
  const [local, others] = splitProps(props as SelectErrorMessageProps, ["class"])
  return (
    <SelectPrimitive.ErrorMessage
      class={cn(labelVariants({ variant: "error" }), local.class)}
      {...others}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectDescription,
  SelectErrorMessage,
  SelectHiddenSelect,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
}

// ----

import { type ComponentProps, createMemo, Show } from "solid-js"
import { IconLoading } from "@/assets/icons"

export type SelectOption = {
  value: string
  label?: JSX.Element | (() => JSX.Element)
}

type SelectCompProps = ComponentProps<typeof Select<SelectOption>> & {
  triggerProps?: ComponentProps<typeof SelectTrigger>
  contentProps?: ComponentProps<typeof SelectContent>
  loading?: boolean
  placeholder?: string
}

export function SelectComp(props: SelectCompProps) {
  const [local, rest] = splitProps(props, [
    "triggerProps",
    "contentProps",
    "options",
    "loading",
    "placeholder",
    "onChange",
  ])

  const placeholderText = createMemo(() => local.placeholder ?? "Select an option")

  function renderItemLabel(rawValue: { value: string; label?: JSX.Element }) {
    const label = children(() => rawValue.label)
    return (
      <Show when={label()} fallback={rawValue.value}>
        {label()}
      </Show>
    )
  }

  // WEIRD WORKAROUND: kobalte calls `onChange` on mount for some reason, so I have to do this.
  let hasMounted = false
  const wrappedOnChange: any = (value: any) => {
    if (!hasMounted) return
    local.onChange?.(value)
  }
  onMount(() => {
    setTimeout(() => {
      hasMounted = true
    }, 80)
  })

  return (
    <Select
      {...rest}
      disabled={local.loading}
      options={local.options}
      placeholder={placeholderText()}
      optionValue={(opt: any) => opt.value}
      optionTextValue={(opt: any) => opt.label}
      itemComponent={(props) => (
        <SelectItem item={props.item}>{renderItemLabel(props.item.rawValue as any)}</SelectItem>
      )}
      onChange={wrappedOnChange}
    >
      <SelectTrigger
        {...local.triggerProps}
        class={cn("", local.loading && "disabled:cursor-progress", local.triggerProps?.class)}
        loading={local.loading}
      >
        <span class="flex items-center gap-2 truncate">
          <span class="truncate">
            <SelectValue<SelectOption>>
              {(state) => (
                <For each={state.selectedOptions()}>
                  {(option, index) => (
                    <span class="contents">
                      {option.label as any}
                      {index() !== state.selectedOptions().length - 1 && ", "}
                    </span>
                  )}
                </For>
              )}
            </SelectValue>
          </span>
        </span>
      </SelectTrigger>
      <SelectContent {...local.contentProps} />
    </Select>
  )
}
