import * as ButtonPrimitive from "@kobalte/core/button"
import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import type { JSX, ValidComponent } from "solid-js"
import { Show, splitProps } from "solid-js"

import { IconLoading } from "@/assets/icons"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 not-disabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        xs: "h-8 rounded-md px-2 py-0 text-[11px]",
        lg: "h-11 px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps<T extends ValidComponent = "button"> = ButtonPrimitive.ButtonRootProps<T> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
    class?: string | undefined
    children?: JSX.Element
  }

const Button = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, ButtonProps<T>>
) => {
  const [local, others] = splitProps(props as ButtonProps, [
    "variant",
    "size",
    "class",
    "loading",
    "disabled",
    "children",
  ])
  return (
    <ButtonPrimitive.Root
      class={buttonVariants({
        variant: local.variant,
        size: local.size,
        class: [props.loading && "disabled:cursor-progress", local.class],
      })}
      disabled={local.disabled || local.loading}
      {...others}
    >
      <Show when={props.loading}>
        <IconLoading class="mr-2 h-4 w-4" />
      </Show>
      {local.children}
    </ButtonPrimitive.Root>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
