import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import * as TooltipPrimitive from "@kobalte/core/tooltip"
import { useMouse } from "bagon-hooks"
import type { ComponentProps, ParentProps, ValidComponent } from "solid-js"
import { type Component, createMemo, createSignal, Show, splitProps } from "solid-js"
import type { JSX } from "solid-js/jsx-runtime"
import { cn } from "@/utils/cn"

const TooltipTrigger = TooltipPrimitive.Trigger

const Tooltip: Component<TooltipPrimitive.TooltipRootProps> = (props) => {
  return <TooltipPrimitive.Root gutter={4} {...props} />
}

type TooltipContentProps<T extends ValidComponent = "div"> =
  TooltipPrimitive.TooltipContentProps<T> & { class?: string | undefined }

const TooltipContent = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, TooltipContentProps<T>>
) => {
  const [local, others] = splitProps(props as TooltipContentProps, ["class"])
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        class={cn(
          "fade-in-0 zoom-in-95 z-50 origin-[var(--kb-popover-content-transform-origin)] animate-flyUpAndScale rounded-md border bg-popover px-3 py-1.5 text-popover-foreground text-sm shadow-md data-[closed]:animate-flyUpAndScaleExit",
          local.class
        )}
        {...others}
      />
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipTrigger }

// ---

/**
 * Gotchas, when using a button inside, make sure to set as="div" to it to avoid SSR issues.
 * @deprecated, I'm polishing solid-tippy instead.
 */
export function TooltipComp(
  props: ParentProps &
    Omit<TooltipPrimitive.TooltipRootProps, "children" | "delayDuration"> & {
      triggerProps?: ComponentProps<typeof TooltipTrigger<"button">>
      contentProps?: ComponentProps<typeof TooltipContent<"button">>
      /** @defaultValue true */
      hideOnClick?: boolean
      content?: JSX.Element
      arrow?: boolean
      followCursor?: boolean | "horizontal" | "vertical"
    }
) {
  // In SolidJS, use splitProps to destructure reactive props for cleaner access
  const [local, rest] = splitProps(props, [
    "children",
    "triggerProps",
    "contentProps",
    "hideOnClick",
    "content",
    "followCursor",
    "arrow",
  ])

  const hideOnClick = createMemo(() => local.hideOnClick ?? true)

  const [contentRef, setContentRef] = createSignal<HTMLElement>()
  const [triggerRef, setTriggerRef] = createSignal<HTMLElement>()

  const { position, ref } = useMouse()
  const gutterY = createMemo(() => {
    if (!local.followCursor || local.followCursor === "horizontal") return undefined
    return position().y - (triggerRef()?.getBoundingClientRect().height ?? 0)
  })
  const shiftX = createMemo(() => {
    if (!local.followCursor || local.followCursor === "vertical") return undefined
    return position().x - (contentRef()?.getBoundingClientRect().width ?? 0) / 2
  })

  return (
    <Tooltip
      openDelay={rest?.openDelay ?? 0}
      closeDelay={rest?.closeDelay ?? 0}
      {...rest}
      {...(local.followCursor && {
        flip: false,
        gutter: gutterY(),
        shift: shiftX(),
        placement: "bottom-start",
      })}
    >
      <TooltipTrigger
        ref={(_ref: any) => {
          setTriggerRef(_ref)
          ref(_ref)
        }}
        {...local.triggerProps}
        onClick={(event) => {
          if (!hideOnClick) {
            event.preventDefault()
          }
        }}
        onPointerDown={(event) => {
          if (!hideOnClick) {
            event.preventDefault()
          }
        }}
      >
        {local.children}
      </TooltipTrigger>
      <TooltipContent
        ref={setContentRef}
        {...local.contentProps}
        onPointerDownOutside={(event) => {
          if (!hideOnClick) {
            event.preventDefault()
          }
          // Chain the original handler if it exists
          local.contentProps?.onPointerDownOutside?.(event)
        }}
      >
        {local.content}
        <Show when={local.arrow ?? true}>
          <TooltipPrimitive.Arrow />
        </Show>
      </TooltipContent>
    </Tooltip>
  )
}
