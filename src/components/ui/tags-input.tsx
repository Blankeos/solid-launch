import { TagsInput as TagsInputPrimitive } from "@ark-ui/solid/tags-input"
import type { PolymorphicProps } from "@kobalte/core"
import type { ValidComponent } from "solid-js"
import { Index, splitProps } from "solid-js"

import { IconX } from "@/assets/icons"
import { cn } from "@/utils/cn"

type TagsInputRootProps = TagsInputPrimitive.RootProps & {
  class?: string | undefined
}

const TagsInputRoot = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, TagsInputRootProps>
) => {
  const [local, others] = splitProps(props as TagsInputRootProps, ["class"])
  return (
    <TagsInputPrimitive.Root
      class={cn("flexflex-col gap-1.5 rounded-md border border-input bg-background", local.class)}
      {...others}
    />
  )
}

type TagsInputLabelProps = TagsInputPrimitive.LabelProps & {
  class?: string | undefined
}

const TagsInputLabel = <T extends ValidComponent = "label">(
  props: PolymorphicProps<T, TagsInputLabelProps>
) => {
  const [local, others] = splitProps(props as TagsInputLabelProps, ["class"])
  return (
    <TagsInputPrimitive.Label
      class={cn(
        "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        local.class
      )}
      {...others}
    />
  )
}

type TagsInputControlProps = TagsInputPrimitive.ControlProps & { class?: string | undefined }

const TagsInputControl = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, TagsInputControlProps>
) => {
  const [local, others] = splitProps(props as TagsInputControlProps, ["class"])
  return (
    <TagsInputPrimitive.Control
      class={cn("flex flex-wrap gap-2 px-3 py-2", local.class)}
      {...others}
    />
  )
}

type TagsInputItemPreviewProps = TagsInputPrimitive.ItemPreviewProps & {
  class?: string | undefined
}

const TagsInputItemPreview = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, TagsInputItemPreviewProps>
) => {
  const [local, others] = splitProps(props as TagsInputItemPreviewProps, ["class"])
  return (
    <TagsInputPrimitive.ItemPreview
      class={cn(
        "inline-flex items-center rounded-full border bg-secondary pr-1 pl-2 text-secondary-foreground text-xs ring-0 ring-primary data-highlighted:ring-2",
        local.class
      )}
      {...others}
    />
  )
}

type TagsInputItemTextProps = TagsInputPrimitive.ItemTextProps & { class?: string | undefined }

const TagsInputItemText = <T extends ValidComponent = "span">(
  props: PolymorphicProps<T, TagsInputItemTextProps>
) => {
  const [local, others] = splitProps(props as TagsInputItemTextProps, ["class"])
  return <TagsInputPrimitive.ItemText class={cn("mr-1.5", local.class)} {...others} />
}

type TagsInputItemDeleteTriggerProps = TagsInputPrimitive.ItemDeleteTriggerProps & {
  class?: string | undefined
}

const TagsInputItemDeleteTrigger = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, TagsInputItemDeleteTriggerProps>
) => {
  const [local, others] = splitProps(props as TagsInputItemDeleteTriggerProps, ["class"])
  return (
    <TagsInputPrimitive.ItemDeleteTrigger
      class={cn(
        "flex h-5 w-5 items-center justify-center rounded-full hover:bg-destructive/20",
        local.class
      )}
      {...others}
    >
      <IconX class="h-3.5 w-3.5" />
    </TagsInputPrimitive.ItemDeleteTrigger>
  )
}

type TagsInputInputProps = TagsInputPrimitive.InputProps & {
  class?: string | undefined
}

const TagsInputInput = <T extends ValidComponent = "input">(
  props: PolymorphicProps<T, TagsInputInputProps>
) => {
  const [local, others] = splitProps(props as TagsInputInputProps, ["class"])
  return (
    <TagsInputPrimitive.Input
      class={cn(
        "flex h-8 flex-1 rounded-md bg-transparent px-2 py-1.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none",
        local.class
      )}
      {...others}
    />
  )
}

type TagsInputClearTriggerProps = TagsInputPrimitive.ClearTriggerProps & {
  class?: string | undefined
}

const TagsInputClearTrigger = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, TagsInputClearTriggerProps>
) => {
  const [local, others] = splitProps(props as TagsInputClearTriggerProps, ["class"])
  return (
    <TagsInputPrimitive.ClearTrigger
      class={cn(
        "absolute top-1/2 right-2 -translate-y-1/2 p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none group-focus-within:opacity-100",
        local.class
      )}
      {...others}
    >
      <IconX class="h-4 w-4" />
    </TagsInputPrimitive.ClearTrigger>
  )
}

export {
  TagsInputRoot as TagsInput,
  TagsInputClearTrigger,
  TagsInputControl,
  TagsInputInput,
  TagsInputItemDeleteTrigger,
  TagsInputItemPreview,
  TagsInputItemText,
  TagsInputLabel,
}

// ---

export type TagsInputCompProps = TagsInputRootProps & {
  label?: string | undefined
  placeholder?: string
  defaultValue?: string[]
  value?: string[]
  disabled?: boolean
  invalid?: boolean
  readOnly?: boolean
  required?: boolean
  max?: number
  maxLength?: number
  delimiter?: string | RegExp
  validate?: (attrs: { value: string[]; inputValue: string }) => boolean
  blurBehavior?: "clear" | "add"
  addOnPaste?: boolean
  allowOverflow?: boolean
  editable?: boolean
}

const TagsInputComp = (props: TagsInputCompProps) => {
  const [local, others] = splitProps(props as TagsInputCompProps, [
    "label",
    "placeholder",
    "defaultValue",
    "value",
    "onValueChange",
    "disabled",
    "invalid",
    "readOnly",
    "required",
    "max",
    "maxLength",
    "delimiter",
    "validate",
    "blurBehavior",
    "addOnPaste",
    "allowOverflow",
    "editable",
  ])

  return (
    <TagsInputRoot
      value={local.value}
      defaultValue={local.defaultValue}
      onValueChange={local.onValueChange}
      disabled={local.disabled}
      invalid={local.invalid}
      readOnly={local.readOnly}
      required={local.required}
      max={local.max}
      maxLength={local.maxLength}
      delimiter={local.delimiter}
      validate={local.validate}
      blurBehavior={local.blurBehavior}
      addOnPaste={local.addOnPaste}
      allowOverflow={local.allowOverflow}
      editable={local.editable}
      {...others}
    >
      <div class="relative">
        <TagsInputLabel>{local.label}</TagsInputLabel>
        <TagsInputControl>
          <TagsInputPrimitive.Context>
            {(api) => (
              <>
                <Index each={api().value}>
                  {(value, index) => (
                    <TagsInputPrimitive.Item index={index} value={value()}>
                      <TagsInputItemPreview>
                        <TagsInputItemText>{value()}</TagsInputItemText>
                        <TagsInputItemDeleteTrigger />
                      </TagsInputItemPreview>
                      <TagsInputPrimitive.ItemInput />
                    </TagsInputPrimitive.Item>
                  )}
                </Index>
                <TagsInputInput placeholder={local.placeholder} />
              </>
            )}
          </TagsInputPrimitive.Context>
          <TagsInputClearTrigger />
        </TagsInputControl>
      </div>
      <TagsInputPrimitive.HiddenInput />
    </TagsInputRoot>
  )
}

export { TagsInputComp }
