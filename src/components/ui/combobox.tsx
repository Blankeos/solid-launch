import * as ComboboxPrimitive from "@kobalte/core/combobox"
import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import type { JSX, ValidComponent } from "solid-js"
import { Show, splitProps } from "solid-js"

import { cn } from "@/utils/cn"

const Combobox = ComboboxPrimitive.Root
const ComboboxItemLabel = ComboboxPrimitive.ItemLabel
const ComboboxHiddenSelect = ComboboxPrimitive.HiddenSelect

type ComboboxItemProps<T extends ValidComponent = "li"> = ComboboxPrimitive.ComboboxItemProps<T> & {
  class?: string | undefined
}

const ComboboxItem = <T extends ValidComponent = "li">(
  props: PolymorphicProps<T, ComboboxItemProps<T>>
) => {
  const [local, others] = splitProps(props as ComboboxItemProps, ["class"])
  return (
    <ComboboxPrimitive.Item
      class={cn(
        "relative flex cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50",
        local.class
      )}
      {...others}
    />
  )
}

type ComboboxItemIndicatorProps<T extends ValidComponent = "div"> =
  ComboboxPrimitive.ComboboxItemIndicatorProps<T> & {
    children?: JSX.Element
  }

const ComboboxItemIndicator = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, ComboboxItemIndicatorProps<T>>
) => {
  const [local, others] = splitProps(props as ComboboxItemIndicatorProps, ["children"])
  return (
    <ComboboxPrimitive.ItemIndicator {...others}>
      <Show
        when={local.children}
        fallback={
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
            <path d="M5 12l5 5l10 -10" />
          </svg>
        }
      >
        {(children) => children()}
      </Show>
    </ComboboxPrimitive.ItemIndicator>
  )
}

type ComboboxSectionProps<T extends ValidComponent = "li"> =
  ComboboxPrimitive.ComboboxSectionProps<T> & { class?: string | undefined }

const ComboboxSectionType = <T extends ValidComponent = "li">(
  props: PolymorphicProps<T, ComboboxSectionProps<T>>
) => {
  const [local, others] = splitProps(props as ComboboxSectionProps, ["class"])
  return (
    <ComboboxPrimitive.Section
      class={cn(
        "overflow-hidden p-1 px-2 py-1.5 font-medium text-muted-foreground text-xs",
        local.class
      )}
      {...others}
    />
  )
}

type ComboboxControlProps<
  U,
  T extends ValidComponent = "div",
> = ComboboxPrimitive.ComboboxControlProps<U, T> & {
  class?: string | undefined
}

const ComboboxControl = <T, U extends ValidComponent = "div">(
  props: PolymorphicProps<U, ComboboxControlProps<T>>
) => {
  const [local, others] = splitProps(props as ComboboxControlProps<T>, ["class"])
  return (
    <ComboboxPrimitive.Control
      class={cn("flex items-center rounded-md border px-3", local.class)}
      {...others}
    />
  )
}

type ComboboxInputProps<T extends ValidComponent = "input"> =
  ComboboxPrimitive.ComboboxInputProps<T> & { class?: string | undefined }

const ComboboxInput = <T extends ValidComponent = "input">(
  props: PolymorphicProps<T, ComboboxInputProps<T>>
) => {
  const [local, others] = splitProps(props as ComboboxInputProps, ["class"])
  return (
    <ComboboxPrimitive.Input
      class={cn(
        "flex size-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        local.class
      )}
      {...others}
    />
  )
}

type ComboboxTriggerProps<T extends ValidComponent = "button"> =
  ComboboxPrimitive.ComboboxTriggerProps<T> & {
    class?: string | undefined
    children?: JSX.Element
    loading?: boolean
  }

const ComboboxTrigger = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, ComboboxTriggerProps<T>>
) => {
  const [local, others] = splitProps(props as ComboboxTriggerProps, [
    "class",
    "children",
    "loading",
  ])
  return (
    <ComboboxPrimitive.Trigger class={cn("size-4 opacity-50", local.class)} {...others}>
      {local.children}
      <ComboboxPrimitive.Icon>
        <Show
          when={local.loading}
          fallback={
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
              <path d="M8 9l4 -4l4 4" />
              <path d="M16 15l-4 4l-4 -4" />
            </svg>
          }
        >
          <IconLoading class="size-4 shrink-0" />
        </Show>
      </ComboboxPrimitive.Icon>
    </ComboboxPrimitive.Trigger>
  )
}

type ComboboxContentProps<T extends ValidComponent = "div"> =
  ComboboxPrimitive.ComboboxContentProps<T> & { class?: string | undefined }

const ComboboxContent = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, ComboboxContentProps<T>>
) => {
  const [local, others] = splitProps(props as ComboboxContentProps, ["class"])
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Content
        class={cn(
          "fade-in-80 relative z-50 min-w-32 animate-in overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-expanded:animate-flyUpAndScale",
          local.class
        )}
        {...others}
      >
        <ComboboxPrimitive.Listbox class="m-0 p-1" />
      </ComboboxPrimitive.Content>
    </ComboboxPrimitive.Portal>
  )
}

export {
  Combobox,
  ComboboxItem,
  ComboboxItemLabel,
  ComboboxItemIndicator,
  ComboboxSectionType as ComboboxSection,
  ComboboxControl,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxHiddenSelect,
  ComboboxContent,
}

// ---
import type { ComponentProps } from "solid-js"
import { children, For } from "solid-js"
import { IconLoading, IconX } from "@/assets/icons"

export type ComboboxOption = {
  value: string
  label?: JSX.Element | (() => JSX.Element)
  disabled?: boolean
}

export type ComboboxSectionType = {
  label?: JSX.Element | (() => JSX.Element)
  options: ComboboxOption[]
}

export type ComboboxCompProps = ComponentProps<
  typeof Combobox<ComboboxOption, ComboboxSectionType>
> & {
  controlProps?: ComponentProps<typeof ComboboxControl>
  contentProps?: ComponentProps<typeof ComboboxContent>
  inputProps?: ComponentProps<typeof ComboboxInput>
  loading?: boolean
  placeholder?: string
}

export function ComboboxComp(props: ComboboxCompProps) {
  const [local, rest] = splitProps(props, [
    "controlProps",
    "contentProps",
    "inputProps",
    "loading",
    "placeholder",
    "options",
    "value",
    "onChange",
    "children",
  ])

  const hasSections = () => {
    const opts = local.options
    return opts.length > 0 && "options" in (opts[0] as any)
  }

  function renderItemLabel(rawValue: { value: string; label?: JSX.Element }) {
    const label = children(() => rawValue.label)
    return (
      <Show when={label()} fallback={rawValue.value}>
        {label()}
      </Show>
    )
  }

  return (
    <Combobox
      {...rest}
      placeholder={local.placeholder}
      disabled={local.loading || rest.disabled}
      options={local.options}
      // @ts-expect-error
      optionValue="value"
      optionTextValue={(option: any) => {
        const label = option.label
        if (typeof label === "string") return label
        if (typeof label === "function") return "custom-label"
        return option.value
      }}
      optionLabel={(option: any) => {
        const label = option.label
        if (typeof label === "string") return label
        if (typeof label === "function") return "custom-label"
        return option.value
      }}
      // @ts-expect-error
      optionDisabled="disabled"
      // @ts-expect-error
      optionGroupChildren={hasSections() ? "options" : undefined}
      value={local.value}
      onChange={local.onChange as any}
      itemComponent={(props) => (
        <ComboboxItem item={props.item}>
          <ComboboxItemLabel>{renderItemLabel(props.item.rawValue as any)}</ComboboxItemLabel>
          <ComboboxItemIndicator />
        </ComboboxItem>
      )}
      sectionComponent={
        hasSections()
          ? (props) => {
              const label = children(() => (props.section.rawValue as any).label as any)
              return (
                <ComboboxSectionType>
                  <Show when={label()} fallback={"Section"}>
                    {label()}
                  </Show>
                </ComboboxSectionType>
              )
            }
          : undefined
      }
    >
      <Show
        when={props.multiple}
        children={
          // @ts-expect-error
          <ComboboxControl<T>
            {...local.controlProps}
            class={cn(
              local.controlProps?.class,
              local.loading && "disabled:cursor-progress",
              "gap-1"
            )}
            aria-label={local.placeholder || "Select"}
          >
            {(state) => (
              <>
                <div class="flex w-full flex-wrap gap-x-1">
                  <For each={state.selectedOptions()}>
                    {(option: any) => (
                      <span
                        class="mt-1.5 inline-flex h-8 items-center rounded-full border bg-secondary px-2 py-1 text-secondary-foreground text-sm ring-0 ring-primary has-focus-visible:ring-2"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        {typeof option.label === "function"
                          ? option.label()
                          : option.label || option.value}
                        <button
                          type="button"
                          class="ml-1 flex h-6 w-6 items-center justify-center rounded-full outline-none hover:bg-destructive/10"
                          onClick={() => state.remove(option)}
                        >
                          <IconX class="size-4" />
                        </button>
                      </span>
                    )}
                  </For>
                  <ComboboxInput {...local.inputProps} />
                </div>

                <ComboboxTrigger loading={local.loading} />
              </>
            )}
          </ComboboxControl>
        }
        fallback={
          <ComboboxControl
            {...local.controlProps}
            class={cn(local.controlProps?.class, local.loading && "disabled:cursor-progress")}
            aria-label={local.placeholder || "Select"}
          >
            <ComboboxInput {...local.inputProps} />
            <ComboboxTrigger loading={local.loading} />
          </ComboboxControl>
        }
      ></Show>
      <ComboboxContent {...local.contentProps} />
    </Combobox>
  )
}
