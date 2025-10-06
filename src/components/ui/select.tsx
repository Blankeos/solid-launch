import { cn } from '@/utils/cn'
import type { PolymorphicProps } from '@kobalte/core/polymorphic'
import * as SelectPrimitive from '@kobalte/core/select'
import { cva } from 'class-variance-authority'
import { children, splitProps, ValidComponent } from 'solid-js'
import { JSX } from 'solid-js/jsx-runtime'

const Select = SelectPrimitive.Root
const SelectValue = SelectPrimitive.Value
const SelectHiddenSelect = SelectPrimitive.HiddenSelect

type SelectTriggerProps<T extends ValidComponent = 'button'> =
  SelectPrimitive.SelectTriggerProps<T> & {
    class?: string | undefined
    children?: JSX.Element
  }

const SelectTrigger = <T extends ValidComponent = 'button'>(
  props: PolymorphicProps<T, SelectTriggerProps<T>>
) => {
  const [local, others] = splitProps(props as SelectTriggerProps, ['class', 'children'])
  return (
    <SelectPrimitive.Trigger
      class={cn(
        'border-input ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        local.class
      )}
      {...others}
    >
      {local.children}
      <SelectPrimitive.Icon
        as="svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-4 opacity-50"
      >
        <path d="M8 9l4 -4l4 4" />
        <path d="M16 15l-4 4l-4 -4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

type SelectContentProps<T extends ValidComponent = 'div'> =
  SelectPrimitive.SelectContentProps<T> & { class?: string | undefined }

const SelectContent = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, SelectContentProps<T>>
) => {
  const [local, others] = splitProps(props as SelectContentProps, ['class'])
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        class={cn(
          'bg-popover text-popover-foreground data-expanded:animate-flyUpAndScale animate-flyUpAndScaleExit fade-in-80 relative z-50 min-w-32 overflow-hidden rounded-md border shadow-md',
          local.class
        )}
        {...others}
      >
        <SelectPrimitive.Listbox class="m-0 p-1" />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

type SelectItemProps<T extends ValidComponent = 'li'> = SelectPrimitive.SelectItemProps<T> & {
  class?: string | undefined
  children?: JSX.Element
}

const SelectItem = <T extends ValidComponent = 'li'>(
  props: PolymorphicProps<T, SelectItemProps<T>>
) => {
  const [local, others] = splitProps(props as SelectItemProps, ['class', 'children'])
  return (
    <SelectPrimitive.Item
      class={cn(
        'focus:bg-accent focus:text-accent-foreground relative mt-0 flex w-full cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        local.class
      )}
      {...others}
    >
      <SelectPrimitive.ItemIndicator class="absolute right-2 flex size-3.5 items-center justify-center">
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
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M5 12l5 5l10 -10" />
        </svg>
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemLabel>{local.children}</SelectPrimitive.ItemLabel>
    </SelectPrimitive.Item>
  )
}

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        label: 'data-[invalid]:text-destructive',
        description: 'font-normal text-muted-foreground',
        error: 'text-xs text-destructive',
      },
    },
    defaultVariants: {
      variant: 'label',
    },
  }
)

type SelectLabelProps<T extends ValidComponent = 'label'> = SelectPrimitive.SelectLabelProps<T> & {
  class?: string | undefined
}

const SelectLabel = <T extends ValidComponent = 'label'>(
  props: PolymorphicProps<T, SelectLabelProps<T>>
) => {
  const [local, others] = splitProps(props as SelectLabelProps, ['class'])
  return <SelectPrimitive.Label class={cn(labelVariants(), local.class)} {...others} />
}

type SelectDescriptionProps<T extends ValidComponent = 'div'> =
  SelectPrimitive.SelectDescriptionProps<T> & {
    class?: string | undefined
  }

const SelectDescription = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, SelectDescriptionProps<T>>
) => {
  const [local, others] = splitProps(props as SelectDescriptionProps, ['class'])
  return (
    <SelectPrimitive.Description
      class={cn(labelVariants({ variant: 'description' }), local.class)}
      {...others}
    />
  )
}

type SelectErrorMessageProps<T extends ValidComponent = 'div'> =
  SelectPrimitive.SelectErrorMessageProps<T> & {
    class?: string | undefined
  }

const SelectErrorMessage = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, SelectErrorMessageProps<T>>
) => {
  const [local, others] = splitProps(props as SelectErrorMessageProps, ['class'])
  return (
    <SelectPrimitive.ErrorMessage
      class={cn(labelVariants({ variant: 'error' }), local.class)}
      {...others}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectDescription,
  SelectErrorMessage,
  SelectHiddenSelect,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
}

// ----

import { IconLoading } from '@/assets/icons'
import { ComponentProps, createMemo, Show } from 'solid-js'

export type SelectOption = {
  value: string
  label?: JSX.Element
}

type SelectCompProps = ComponentProps<typeof Select<SelectOption>> & {
  triggerProps?: ComponentProps<typeof SelectTrigger>
  contentProps?: ComponentProps<typeof SelectContent>
  loading?: boolean
  placeholder?: string
}

export function SelectComp(props: SelectCompProps) {
  const [local, rest] = splitProps(props, [
    'triggerProps',
    'contentProps',
    'options',
    'loading',
    'placeholder',
  ])

  const placeholderText = createMemo(() => local.placeholder ?? 'Select an option')

  const labelsMap = createMemo(() => {
    if (!local.options) {
      return {}
    }
    return local.options.reduce(
      (acc: Record<string, JSX.Element>, option: { value: string; label?: JSX.Element }) => {
        acc[option.value] = option.label ?? option.value
        return acc
      },
      {} as Record<string, JSX.Element>
    )
  })

  function renderItemLabel(rawValue: { value: string; label?: JSX.Element }) {
    const label = children(() => rawValue.label)
    return (
      <Show when={label()} fallback={rawValue.value}>
        {label()}
      </Show>
    )
  }

  // const normalizedValue = createMemo(() => {
  //   if (!local.value) return undefined;
  //   if (typeof local.value === 'string') {
  //     return local.options?.find((opt: SelectOption) => opt.value === local.value);
  //   }
  //   return local.value;
  // });

  return (
    <Select
      {...rest}
      disabled={local.loading}
      options={local.options}
      placeholder={placeholderText()}
      optionValue={(opt: any) => opt.value}
      optionTextValue={(opt: any) => opt.label}
      itemComponent={(props) => (
        <SelectItem item={props.item}>{renderItemLabel(props.item.rawValue as any)}</SelectItem>
      )}
    >
      <SelectTrigger
        {...local.triggerProps}
        class={cn('', local.loading && 'disabled:cursor-progress')}
      >
        <span class="flex items-center gap-2">
          <Show when={local.loading}>
            <IconLoading class="size-4" />
          </Show>
          <SelectValue<SelectOption>>
            {(state) =>
              state
                .selectedOptions()
                ?.map((_option) => _option.label)
                ?.join(', ')
            }
          </SelectValue>
        </span>
      </SelectTrigger>
      <SelectContent {...local.contentProps} />
    </Select>
  )
}
