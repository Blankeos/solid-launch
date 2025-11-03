import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import type { Component, ComponentProps } from "solid-js"
import { splitProps } from "solid-js"

import { cn } from "@/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-background text-foreground",
        success: "border-success bg-success/20 text-success",
        warning: "border-warning bg-warning/20 text-warning",
        error: "border-error bg-error/20 text-error",
        info: "border-info bg-info/20 text-info",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-1.5 py-0.5 text-[9px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type BadgeProps = ComponentProps<"div"> &
  VariantProps<typeof badgeVariants> & {
    round?: boolean
  }

const Badge: Component<BadgeProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "variant", "round", "size"])
  return (
    <div
      class={cn(
        badgeVariants({ variant: local.variant, size: local.size }),
        local.round && "rounded-full",
        local.class
      )}
      {...others}
    />
  )
}

export { Badge, badgeVariants }
export type { BadgeProps }
