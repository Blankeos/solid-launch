import * as AccordionPrimitive from "@kobalte/core/accordion"
import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import type { JSX, ValidComponent } from "solid-js"
import { For, splitProps } from "solid-js"

import { cn } from "@/utils/cn"

const Accordion = AccordionPrimitive.Root

type AccordionItemProps<T extends ValidComponent = "div"> =
  AccordionPrimitive.AccordionItemProps<T> & {
    class?: string | undefined
  }

const AccordionItem = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, AccordionItemProps<T>>
) => {
  const [local, others] = splitProps(props as AccordionItemProps, ["class"])
  return (
    <AccordionPrimitive.Item
      class={cn("border-border border-b last:border-b-transparent", local.class)}
      {...others}
    />
  )
}

type AccordionTriggerProps<T extends ValidComponent = "button"> =
  AccordionPrimitive.AccordionTriggerProps<T> & {
    class?: string | undefined
    children?: JSX.Element
  }

const AccordionTrigger = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, AccordionTriggerProps<T>>
) => {
  const [local, others] = splitProps(props as AccordionTriggerProps, ["class", "children"])
  return (
    <AccordionPrimitive.Header class="flex">
      <AccordionPrimitive.Trigger
        class={cn(
          "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left font-medium text-sm outline-none transition-all hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-expanded]>svg]:rotate-180",
          local.class
        )}
        {...others}
      >
        {local.children}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200"
        >
          <path d="M6 9l6 6l6 -6" />
        </svg>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

type AccordionContentProps<T extends ValidComponent = "div"> =
  AccordionPrimitive.AccordionContentProps<T> & {
    class?: string | undefined
    children?: JSX.Element
  }

const AccordionContent = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, AccordionContentProps<T>>
) => {
  const [local, others] = splitProps(props as AccordionContentProps, ["class", "children"])
  return (
    <AccordionPrimitive.Content
      class={cn(
        "animate-accordion-up overflow-hidden text-sm transition-all data-[expanded]:animate-accordion-down",
        local.class
      )}
      {...others}
    >
      <div class="pt-0 pb-4">{local.children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }

// ---

type AccordionItemContent = {
  value?: string
  trigger: JSX.Element // Content for the AccordionTrigger
  content: JSX.Element // Content for the AccordionContent
  itemProps?: PolymorphicProps<"div", AccordionPrimitive.AccordionItemProps<"div">> // Props for the AccordionItem (includes value, disabled, class, etc.)
}

export function AccordionComp(
  props: AccordionPrimitive.AccordionRootProps & {
    items: AccordionItemContent[]
    triggerProps?: PolymorphicProps<"button", AccordionPrimitive.AccordionTriggerProps<"button">> // Shared props for all AccordionTriggers
    contentProps?: PolymorphicProps<"div", AccordionPrimitive.AccordionContentProps<"div">> // Shared props for all AccordionContents
  }
) {
  const [local, rootProps] = splitProps(props, ["items", "triggerProps", "contentProps"])

  return (
    <Accordion {...rootProps}>
      <For each={local.items}>
        {(item, index) => {
          const value = () => item.value ?? item.itemProps?.value ?? `item-${index()}`
          return (
            <AccordionItem value={value()} {...item.itemProps}>
              <AccordionTrigger {...local.triggerProps}>{item.trigger}</AccordionTrigger>
              <AccordionContent {...local.contentProps}>{item.content}</AccordionContent>
            </AccordionItem>
          )
        }}
      </For>
    </Accordion>
  )
}
