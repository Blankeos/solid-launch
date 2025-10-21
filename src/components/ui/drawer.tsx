import type {
  ContentProps,
  DescriptionProps,
  DynamicProps,
  LabelProps,
  OverlayProps,
} from "@corvu/drawer"
import DrawerPrimitive from "@corvu/drawer"
import type { Component, ComponentProps, JSX, ValidComponent } from "solid-js"
import { Show, splitProps } from "solid-js"

import { cn } from "@/utils/cn"

const Drawer = DrawerPrimitive

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

type DrawerOverlayProps<T extends ValidComponent = "div"> = OverlayProps<T> & { class?: string }

const DrawerOverlay = <T extends ValidComponent = "div">(
  props: DynamicProps<T, DrawerOverlayProps<T>>
) => {
  const [, rest] = splitProps(props as DrawerOverlayProps, ["class"])
  const drawerContext = DrawerPrimitive.useContext()
  return (
    <DrawerPrimitive.Overlay
      class={cn(
        "fixed inset-0 z-50 data-[transitioning]:transition-colors data-[transitioning]:duration-300",
        props.class
      )}
      style={{
        "background-color": `rgb(0 0 0 / ${0.8 * drawerContext.openPercentage()})`,
      }}
      {...rest}
    />
  )
}

type DrawerContentProps<T extends ValidComponent = "div"> = ContentProps<T> & {
  class?: string
  children?: JSX.Element
  showOverlay?: boolean
}

const DrawerContent = <T extends ValidComponent = "div">(
  props: DynamicProps<T, DrawerContentProps<T>>
) => {
  const [local, rest] = splitProps(props as DrawerContentProps, [
    "class",
    "children",
    "showOverlay",
  ])
  return (
    <DrawerPortal>
      <Show when={local.showOverlay ?? true}>
        <DrawerOverlay />
      </Show>
      <DrawerPrimitive.Content
        class={cn(
          "group/drawer-content fixed z-50 flex h-auto flex-col bg-background outline-none data-[transitioning]:duration-300",
          // Top
          "data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:mx-0 data-[side=top]:mt-0 data-[side=top]:mb-24 data-[side=top]:max-h-[100vh] data-[side=top]:rounded-b-[12px] data-[side=top]:border-b",
          "data-[side=top]:after:absolute data-[side=top]:after:inset-x-0 data-[side=top]:after:bottom-full data-[side=top]:after:h-1/2 data-[side=top]:after:bg-inherit",
          // Bottom
          "data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:mx-0 data-[side=bottom]:mt-0 data-[side=bottom]:mb-0 data-[side=bottom]:max-h-[100vh] data-[side=bottom]:rounded-t-[12px] data-[side=bottom]:border-t",
          "data-[side=bottom]:after:absolute data-[side=bottom]:after:inset-x-0 data-[side=bottom]:after:top-full data-[side=bottom]:after:h-1/2 data-[side=bottom]:after:bg-inherit",
          // Right
          "data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:my-0 data-[side=right]:mr-0 data-[side=right]:w-3/4 data-[side=right]:rounded-l-[12px] data-[side=right]:border-l data-[side=right]:sm:max-w-sm",
          "data-[side=right]:after:absolute data-[side=right]:after:inset-y-0 data-[side=right]:after:left-full data-[side=right]:after:w-1/2 data-[side=right]:after:bg-inherit",
          // Left
          "data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:my-0 data-[side=left]:ml-0 data-[side=left]:w-3/4 data-[side=left]:rounded-r-[12px] data-[side=left]:border-r data-[side=left]:sm:max-w-sm",
          "data-[side=left]:after:absolute data-[side=left]:after:inset-y-0 data-[side=left]:after:right-full data-[side=left]:after:w-1/2 data-[side=left]:after:bg-inherit",
          props.class
        )}
        {...rest}
      >
        <div class="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        {props.children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

const DrawerHeader: Component<ComponentProps<"div">> = (props) => {
  const [, rest] = splitProps(props, ["class"])
  return <div class={cn("grid gap-1.5 p-4 text-center sm:text-left", props.class)} {...rest} />
}

const DrawerFooter: Component<ComponentProps<"div">> = (props) => {
  const [, rest] = splitProps(props, ["class"])
  return <div class={cn("t-auto flex flex-col gap-2 p-4", props.class)} {...rest} />
}

type DrawerTitleProps<T extends ValidComponent = "div"> = LabelProps<T> & { class?: string }

const DrawerTitle = <T extends ValidComponent = "div">(
  props: DynamicProps<T, DrawerTitleProps<T>>
) => {
  const [, rest] = splitProps(props as DrawerTitleProps, ["class"])
  return (
    <DrawerPrimitive.Label
      class={cn("font-semibold text-lg leading-none tracking-tight", props.class)}
      {...rest}
    />
  )
}

type DrawerDescriptionProps<T extends ValidComponent = "div"> = DescriptionProps<T> & {
  class?: string
}

const DrawerDescription = <T extends ValidComponent = "div">(
  props: DynamicProps<T, DrawerDescriptionProps<T>>
) => {
  const [, rest] = splitProps(props as DrawerDescriptionProps, ["class"])
  return (
    <DrawerPrimitive.Description
      class={cn("text-muted-foreground text-sm", props.class)}
      {...rest}
    />
  )
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
}
