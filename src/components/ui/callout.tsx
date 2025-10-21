import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import type { Component, ComponentProps } from "solid-js"
import { splitProps } from "solid-js"

import { cn } from "@/utils/cn"

const calloutVariants = cva("rounded-md border-l-4 p-2 pl-4", {
  variants: {
    variant: {
      default: "border-info bg-info/20 text-info",
      success: "border-success bg-success/20 text-success",
      warning: "border-warning bg-warning/40 text-warning",
      error: "border-error bg-error/20 text-error",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

type CalloutProps = ComponentProps<"div"> & VariantProps<typeof calloutVariants>

const Callout: Component<CalloutProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "variant"])
  return <div class={cn(calloutVariants({ variant: local.variant }), local.class)} {...others} />
}

const CalloutTitle: Component<ComponentProps<"h3">> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return <h3 class={cn("font-semibold", local.class)} {...others} />
}

const CalloutContent: Component<ComponentProps<"div">> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return <div class={cn("mt-2", local.class)} {...others} />
}

export { Callout, CalloutContent, CalloutTitle }

// ---

export const CalloutComp = (
  props: CalloutProps & {
    title?: string
    content?: string
  }
) => {
  return (
    <Callout variant={props.variant} class={props.class}>
      <CalloutTitle>{props.title}</CalloutTitle>
      <CalloutContent>{props.content}</CalloutContent>
    </Callout>
  )
}
