import type { ValidComponent } from 'solid-js'
import { splitProps } from 'solid-js'

import type { PolymorphicProps } from '@kobalte/core/polymorphic'
import * as TabsPrimitive from '@kobalte/core/tabs'

import { cn } from '@/utils/cn'

const Tabs = TabsPrimitive.Root

type TabsListProps<T extends ValidComponent = 'div'> = TabsPrimitive.TabsListProps<T> & {
  class?: string | undefined
}

const TabsList = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TabsListProps<T>>
) => {
  const [local, others] = splitProps(props as TabsListProps, ['class'])
  return (
    <TabsPrimitive.List
      class={cn(
        'bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1',
        local.class
      )}
      {...others}
    />
  )
}

type TabsTriggerProps<T extends ValidComponent = 'button'> = TabsPrimitive.TabsTriggerProps<T> & {
  class?: string | undefined
}

const TabsTrigger = <T extends ValidComponent = 'button'>(
  props: PolymorphicProps<T, TabsTriggerProps<T>>
) => {
  const [local, others] = splitProps(props as TabsTriggerProps, ['class'])
  return (
    <TabsPrimitive.Trigger
      class={cn(
        'ring-offset-background focus-visible:ring-ring data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:border-input inline-flex items-center justify-center rounded-sm border border-transparent px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[selected]:shadow-sm',
        local.class
      )}
      {...others}
    />
  )
}

// "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",

type TabsContentProps<T extends ValidComponent = 'div'> = TabsPrimitive.TabsContentProps<T> & {
  class?: string | undefined
}

const TabsContent = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TabsContentProps<T>>
) => {
  const [local, others] = splitProps(props as TabsContentProps, ['class'])
  return (
    <TabsPrimitive.Content
      class={cn(
        'ring-offset-background focus-visible:ring-ring mt-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        local.class
      )}
      {...others}
    />
  )
}

type TabsIndicatorProps<T extends ValidComponent = 'div'> = TabsPrimitive.TabsIndicatorProps<T> & {
  class?: string | undefined
}

const TabsIndicator = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TabsIndicatorProps<T>>
) => {
  const [local, others] = splitProps(props as TabsIndicatorProps, ['class'])
  return (
    <TabsPrimitive.Indicator
      class={cn(
        'duration-250ms absolute transition-all data-[orientation=horizontal]:-bottom-px data-[orientation=horizontal]:h-[2px] data-[orientation=vertical]:-right-px data-[orientation=vertical]:w-[2px]',
        local.class
      )}
      {...others}
    />
  )
}

export { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger }
