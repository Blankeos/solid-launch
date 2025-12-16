import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import * as PopoverPrimitive from "@kobalte/core/popover"
import type { Component, ComponentProps, ValidComponent } from "solid-js"
import { Show, splitProps } from "solid-js"
import type { JSX } from "solid-js/jsx-runtime"
import { cn } from "@/utils/cn"

const PopoverTrigger = PopoverPrimitive.Trigger

const Popover: Component<PopoverPrimitive.PopoverRootProps> = (props) => {
  return <PopoverPrimitive.Root gutter={4} {...props} />
}

type PopoverContentProps<T extends ValidComponent = "div"> =
  PopoverPrimitive.PopoverContentProps<T> & { class?: string | undefined }

const PopoverContent = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, PopoverContentProps<T>>
) => {
  const [local, others] = splitProps(props as PopoverContentProps, ["class"])
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        class={cn(
          "z-50 origin-[var(--kb-popover-content-transform-origin)] rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[closed]:animate-flyUpAndScaleExit data-[expanded]:animate-flyUpAndScale",
          local.class
        )}
        {...others}
      />
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverContent, PopoverTrigger }

// ---

export const PopoverComp: Component<
  ComponentProps<typeof Popover> & {
    content?: JSX.Element
    contentProps?: ComponentProps<typeof PopoverContent>
    children: JSX.Element
    arrow?: boolean
  }
> = (props) => {
  const [local, rest] = splitProps(props, ["children", "content", "contentProps", "arrow"])
  return (
    <Popover {...rest}>
      <PopoverTrigger>{local.children}</PopoverTrigger>
      <PopoverContent {...local.contentProps}>
        <Show when={local.arrow === true}>
          <PopoverPrimitive.Arrow />
        </Show>
        {local.content}
      </PopoverContent>
    </Popover>
  )
}
