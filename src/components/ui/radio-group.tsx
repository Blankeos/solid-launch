import type { JSX, ValidComponent } from 'solid-js'
import { For, splitProps } from 'solid-js'

import type { PolymorphicProps } from '@kobalte/core/polymorphic'
import * as RadioGroupPrimitive from '@kobalte/core/radio-group'

import { cn } from '@/utils/cn'

type RadioGroupRootProps<T extends ValidComponent = 'div'> =
  RadioGroupPrimitive.RadioGroupRootProps<T> & { class?: string | undefined }

const RadioGroup = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, RadioGroupRootProps<T>>
) => {
  const [local, others] = splitProps(props as RadioGroupRootProps, ['class'])
  return <RadioGroupPrimitive.Root class={cn('grid gap-2', local.class)} {...others} />
}

type RadioGroupItemProps<T extends ValidComponent = 'div'> =
  RadioGroupPrimitive.RadioGroupItemProps<T> & {
    class?: string | undefined
    children?: JSX.Element
  }

const RadioGroupItem = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, RadioGroupItemProps<T>>
) => {
  const [local, others] = splitProps(props as RadioGroupItemProps, ['class', 'children'])
  return (
    <RadioGroupPrimitive.Item class={cn('flex items-center space-x-2', local.class)} {...others}>
      <RadioGroupPrimitive.ItemInput />
      <RadioGroupPrimitive.ItemControl class="data-checked:border-primary text-primary ring-offset-background focus-visible:ring-ring aspect-square size-4 rounded-full border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <RadioGroupPrimitive.ItemIndicator class="flex h-full items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-2.5 fill-current text-current"
          >
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          </svg>
        </RadioGroupPrimitive.ItemIndicator>
      </RadioGroupPrimitive.ItemControl>
      {local.children}
    </RadioGroupPrimitive.Item>
  )
}

type RadioGroupLabelProps<T extends ValidComponent = 'label'> =
  RadioGroupPrimitive.RadioGroupLabelProps<T> & {
    class?: string | undefined
  }

const RadioGroupItemLabel = <T extends ValidComponent = 'label'>(
  props: PolymorphicProps<T, RadioGroupLabelProps<T>>
) => {
  const [local, others] = splitProps(props as RadioGroupLabelProps, ['class'])
  return (
    <RadioGroupPrimitive.ItemLabel
      class={cn(
        'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        local.class
      )}
      {...others}
    />
  )
}

export { RadioGroup, RadioGroupItem, RadioGroupItemLabel }

// ---

import { ComponentProps, Show } from 'solid-js'

export type RadioGroupOption = {
  value: string
  label?: JSX.Element
}

type RadioGroupCompProps = ComponentProps<typeof RadioGroup> & {
  options: RadioGroupOption[]
  labelProps?: ComponentProps<typeof RadioGroupItemLabel>
  loading?: boolean
}

export function RadioGroupComp(props: RadioGroupCompProps) {
  const [local, rest] = splitProps(props, ['options', 'labelProps', 'loading'])

  function renderLabel(rawValue: RadioGroupOption) {
    return (
      <Show when={rawValue.label} fallback={rawValue.value}>
        {rawValue.label}
      </Show>
    )
  }

  return (
    <RadioGroup disabled={local.loading} {...rest}>
      <For each={local.options}>
        {(opt) => (
          <RadioGroupItem value={opt.value}>
            <RadioGroupItemLabel {...local.labelProps}>{renderLabel(opt)}</RadioGroupItemLabel>
          </RadioGroupItem>
        )}
      </For>
    </RadioGroup>
  )
}
