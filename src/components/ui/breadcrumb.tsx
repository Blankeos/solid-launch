import type { PolymorphicProps } from "@kobalte/core"
import * as BreadcrumbPrimitive from "@kobalte/core/breadcrumbs"
import type { Component, ComponentProps, JSX, ValidComponent } from "solid-js"
import { For, Show, splitProps } from "solid-js"

import { cn } from "@/utils/cn"

const Breadcrumb = BreadcrumbPrimitive.Root

const BreadcrumbList: Component<ComponentProps<"ol">> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <ol
      class={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-muted-foreground text-sm sm:gap-2.5",
        local.class
      )}
      {...others}
    />
  )
}

const BreadcrumbItem: Component<ComponentProps<"li">> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return <li class={cn("inline-flex items-center gap-1.5", local.class)} {...others} />
}

type BreadcrumbLinkProps<T extends ValidComponent = "a"> =
  BreadcrumbPrimitive.BreadcrumbsLinkProps<T> & { class?: string | undefined }

const BreadcrumbLink = <T extends ValidComponent = "a">(
  props: PolymorphicProps<T, BreadcrumbLinkProps<T>>
) => {
  const [local, others] = splitProps(props as BreadcrumbLinkProps, ["class"])
  return (
    <BreadcrumbPrimitive.Link
      class={cn(
        "transition-colors hover:text-foreground data-[current]:font-normal data-[current]:text-foreground",
        local.class
      )}
      {...others}
    />
  )
}

type BreadcrumbSeparatorProps<T extends ValidComponent = "span"> =
  BreadcrumbPrimitive.BreadcrumbsSeparatorProps<T> & {
    class?: string | undefined
    children?: JSX.Element
  }

const BreadcrumbSeparator = <T extends ValidComponent = "span">(
  props: PolymorphicProps<T, BreadcrumbSeparatorProps<T>>
) => {
  const [local, others] = splitProps(props as BreadcrumbSeparatorProps, ["class", "children"])
  return (
    <BreadcrumbPrimitive.Separator class={cn("[&>svg]:size-3.5", local.class)} {...others}>
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
          >
            <path d="M9 6l6 6l-6 6" />
          </svg>
        }
      >
        {local.children}
      </Show>
    </BreadcrumbPrimitive.Separator>
  )
}

const BreadcrumbEllipsis: Component<ComponentProps<"span">> = (props) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <span class={cn("flex size-9 items-center justify-center", local.class)} {...others}>
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
        <path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      </svg>
      <span class="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
}

// ---

export interface BreadcrumbPathItem {
  id: string
  label?: string
  href?: string
  current?: boolean
  isEllipsis?: boolean
}

export function BreadcrumbComp(props: { path: BreadcrumbPathItem[] }) {
  // const path: BreadcrumbPathItem[] = [
  //   { id: 'home', label: 'Home', href: '/' },
  //   { id: 'ellipsis', isEllipsis: true },
  //   { id: 'components', label: 'Components', href: '/components' },
  //   { id: 'breadcrumbs', label: 'Breadcrumbs', current: true },
  // ];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <For each={props.path}>
          {(item, index) => (
            <>
              <BreadcrumbItem>
                <Show
                  when={item.isEllipsis}
                  fallback={
                    <BreadcrumbLink href={item.href} current={item.current}>
                      {item.label}
                    </BreadcrumbLink>
                  }
                >
                  <BreadcrumbEllipsis />
                </Show>
              </BreadcrumbItem>
              {index() < props.path.length - 1 && <BreadcrumbSeparator />}
            </>
          )}
        </For>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

// + Suggestion: Make a useBreadcrumbs hook that will convert a bunch of inputs (i.e. current path) into a BreadcrumbPathItem[].
