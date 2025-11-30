import * as DropdownMenuPrimitive from "@kobalte/core/dropdown-menu"
import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import type { Component, ComponentProps, JSX, ValidComponent } from "solid-js"
import { For, splitProps } from "solid-js"

import { cn } from "@/utils/cn"

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuPortal = DropdownMenuPrimitive.Portal
const DropdownMenuSub = DropdownMenuPrimitive.Sub
const DropdownMenuGroup = DropdownMenuPrimitive.Group
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenu: Component<DropdownMenuPrimitive.DropdownMenuRootProps> = (props) => {
  return <DropdownMenuPrimitive.Root gutter={4} {...props} />
}

type DropdownMenuContentProps<T extends ValidComponent = "div"> =
  DropdownMenuPrimitive.DropdownMenuContentProps<T> & {
    class?: string | undefined
  }

const DropdownMenuContent = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, DropdownMenuContentProps<T>>
) => {
  const [, rest] = splitProps(props as DropdownMenuContentProps, ["class"])
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        class={cn(
          "z-50 min-w-32 origin-[var(--kb-menu-content-transform-origin)] animate-flyUpAndScaleExit overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none data-expanded:animate-flyUpAndScale",
          props.class
        )}
        {...rest}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

type DropdownMenuItemProps<T extends ValidComponent = "div"> =
  DropdownMenuPrimitive.DropdownMenuItemProps<T> & {
    class?: string | undefined
  }

const DropdownMenuItem = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, DropdownMenuItemProps<T>>
) => {
  const [, rest] = splitProps(props as DropdownMenuItemProps, ["class"])
  return (
    <DropdownMenuPrimitive.Item
      class={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        props.class
      )}
      {...rest}
    />
  )
}

const DropdownMenuShortcut: Component<ComponentProps<"span">> = (props) => {
  const [, rest] = splitProps(props, ["class"])
  return <span class={cn("ml-auto text-xs tracking-widest opacity-60", props.class)} {...rest} />
}

const DropdownMenuLabel: Component<ComponentProps<"div"> & { inset?: boolean }> = (props) => {
  const [, rest] = splitProps(props, ["class", "inset"])
  return (
    <div
      class={cn("px-2 py-1.5 font-semibold text-sm", props.inset && "pl-8", props.class)}
      {...rest}
    />
  )
}

type DropdownMenuSeparatorProps<T extends ValidComponent = "hr"> =
  DropdownMenuPrimitive.DropdownMenuSeparatorProps<T> & {
    class?: string | undefined
  }

const DropdownMenuSeparator = <T extends ValidComponent = "hr">(
  props: PolymorphicProps<T, DropdownMenuSeparatorProps<T>>
) => {
  const [, rest] = splitProps(props as DropdownMenuSeparatorProps, ["class"])
  return (
    <DropdownMenuPrimitive.Separator
      class={cn("-mx-1 my-1 h-px bg-muted", props.class)}
      {...rest}
    />
  )
}

type DropdownMenuSubTriggerProps<T extends ValidComponent = "div"> =
  DropdownMenuPrimitive.DropdownMenuSubTriggerProps<T> & {
    class?: string | undefined
    children?: JSX.Element
  }

const DropdownMenuSubTrigger = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, DropdownMenuSubTriggerProps<T>>
) => {
  const [, rest] = splitProps(props as DropdownMenuSubTriggerProps, ["class", "children"])
  return (
    <DropdownMenuPrimitive.SubTrigger
      class={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent",
        props.class
      )}
      {...rest}
    >
      {props.children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="ml-auto size-4"
      >
        <path d="M9 6l6 6l-6 6" />
      </svg>
    </DropdownMenuPrimitive.SubTrigger>
  )
}

type DropdownMenuSubContentProps<T extends ValidComponent = "div"> =
  DropdownMenuPrimitive.DropdownMenuSubContentProps<T> & {
    class?: string | undefined
  }

const DropdownMenuSubContent = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, DropdownMenuSubContentProps<T>>
) => {
  const [, rest] = splitProps(props as DropdownMenuSubContentProps, ["class"])
  return (
    <DropdownMenuPrimitive.SubContent
      class={cn(
        "z-50 min-w-32 origin-[var(--kb-menu-content-transform-origin)] animate-flyUpAndScaleExit overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none data-expanded:animate-flyUpAndScale",
        props.class
      )}
      {...rest}
    />
  )
}

type DropdownMenuCheckboxItemProps<T extends ValidComponent = "div"> =
  DropdownMenuPrimitive.DropdownMenuCheckboxItemProps<T> & {
    class?: string | undefined
    children?: JSX.Element
  }

const DropdownMenuCheckboxItem = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, DropdownMenuCheckboxItemProps<T>>
) => {
  const [, rest] = splitProps(props as DropdownMenuCheckboxItemProps, ["class", "children"])
  return (
    <DropdownMenuPrimitive.CheckboxItem
      class={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        props.class
      )}
      {...rest}
    >
      <span class="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
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
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {props.children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

type DropdownMenuGroupLabelProps<T extends ValidComponent = "span"> =
  DropdownMenuPrimitive.DropdownMenuGroupLabelProps<T> & {
    class?: string | undefined
  }

const DropdownMenuGroupLabel = <T extends ValidComponent = "span">(
  props: PolymorphicProps<T, DropdownMenuGroupLabelProps<T>>
) => {
  const [, rest] = splitProps(props as DropdownMenuGroupLabelProps, ["class"])
  return (
    <DropdownMenuPrimitive.GroupLabel
      class={cn("px-2 py-1.5 font-semibold text-sm", props.class)}
      {...rest}
    />
  )
}

type DropdownMenuRadioItemProps<T extends ValidComponent = "div"> =
  DropdownMenuPrimitive.DropdownMenuRadioItemProps<T> & {
    class?: string | undefined
    children?: JSX.Element
  }

const DropdownMenuRadioItem = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, DropdownMenuRadioItemProps<T>>
) => {
  const [, rest] = splitProps(props as DropdownMenuRadioItemProps, ["class", "children"])
  return (
    <DropdownMenuPrimitive.RadioItem
      class={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        props.class
      )}
      {...rest}
    >
      <span class="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-2 fill-current"
          >
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          </svg>
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {props.children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}

// ---

type OptionItem = {
  type: "item"
  itemId?: string
  itemDisplay?: JSX.Element
  itemOnSelect?: (id?: string) => void
  itemTip?: JSX.Element
  hide?: boolean
} & DropdownMenuItemProps

type OptionSeparator = { type: "separator"; hide?: boolean }

type OptionLabel = { type: "label"; label: JSX.Element; hide?: boolean }

type OptionSub = {
  type: "sub"
  subTrigger: JSX.Element
  subOptions: DropdownMenuOption[]
  hide?: boolean
}

type OptionCheckboxItem = {
  type: "checkbox"
  checked?: boolean
  onChange?: (checked: boolean) => void
  children?: JSX.Element
  label?: JSX.Element
  hide?: boolean
}

type OptionRadioGroup = {
  type: "radio"
  value?: string
  onChange?: (value: string) => void
  options: OptionRadioItem[]
  hide?: boolean
}

type OptionRadioItem = {
  value: string
  label?: JSX.Element
  hide?: boolean
}

export type DropdownMenuOption =
  | OptionLabel
  | OptionItem
  | OptionSeparator
  | OptionSub
  | OptionCheckboxItem
  | OptionRadioGroup

const _DropdownMenuSubComp: Component<{ options: DropdownMenuOption[] }> = (props) => {
  return (
    <For each={props.options}>
      {(option) => {
        if (option.hide) return null

        switch (option.type) {
          case "separator":
            return <DropdownMenuSeparator />
          case "label":
            return <DropdownMenuLabel>{option.label}</DropdownMenuLabel>
          case "sub": {
            const sub = option as OptionSub
            return (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{sub.subTrigger}</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <_DropdownMenuSubComp options={sub.subOptions} />
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )
          }
          case "item": {
            const item = option as OptionItem
            return (
              <DropdownMenuItem onSelect={() => item.itemOnSelect?.(item.itemId)} {...item}>
                {item.itemDisplay}
                {item.itemTip && (
                  <DropdownMenuShortcut class="pl-2">{item.itemTip}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            )
          }
          case "checkbox": {
            const item = option as OptionCheckboxItem
            return (
              <DropdownMenuCheckboxItem checked={item.checked} onChange={item.onChange}>
                {item.children || item.label}
              </DropdownMenuCheckboxItem>
            )
          }
          case "radio": {
            const group = option as OptionRadioGroup
            return (
              <DropdownMenuGroup>
                <DropdownMenuRadioGroup value={group.value} onChange={group.onChange}>
                  <For each={group.options}>
                    {(radioOption) => {
                      if (radioOption.hide) return null
                      return (
                        <DropdownMenuRadioItem value={radioOption.value}>
                          {radioOption.label || radioOption.value}
                        </DropdownMenuRadioItem>
                      )
                    }}
                  </For>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            )
          }
          default:
            return null
        }
      }}
    </For>
  )
}

export const DropdownMenuComp: Component<
  ComponentProps<typeof DropdownMenu> & {
    options: DropdownMenuOption[]
    triggerProps?: ComponentProps<typeof DropdownMenuTrigger<"button">>
  }
> = (props) => {
  const [, rest] = splitProps(props, ["options", "children", "triggerProps"])
  return (
    <DropdownMenu {...rest}>
      <DropdownMenuTrigger {...props.triggerProps}>{props.children}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <_DropdownMenuSubComp options={props.options} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
