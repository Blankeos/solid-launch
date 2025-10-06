import type { ComponentProps, JSX, ValidComponent } from 'solid-js'
import { children, Show, splitProps } from 'solid-js'

import type { PolymorphicProps } from '@kobalte/core'
import * as SwitchPrimitive from '@kobalte/core/switch'

import { cn } from '@/utils/cn'

const Switch = SwitchPrimitive.Root
const SwitchDescription = SwitchPrimitive.Description
const SwitchErrorMessage = SwitchPrimitive.ErrorMessage

type SwitchControlProps = SwitchPrimitive.SwitchControlProps & {
  class?: string | undefined
  children?: JSX.Element
}

const SwitchControl = <T extends ValidComponent = 'input'>(
  props: PolymorphicProps<T, SwitchControlProps>
) => {
  const [local, others] = splitProps(props as SwitchControlProps, ['class', 'children'])
  return (
    <>
      <SwitchPrimitive.Input
        class={cn(
          '[&:focus-visible+div]:ring-ring [&:focus-visible+div]:ring-offset-background [&:focus-visible+div]:ring-2 [&:focus-visible+div]:ring-offset-2 [&:focus-visible+div]:outline-none',
          local.class
        )}
      />
      <SwitchPrimitive.Control
        class={cn(
          'bg-input data-[checked]:bg-primary inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-[color,background-color,box-shadow] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
          local.class
        )}
        {...others}
      >
        {local.children}
      </SwitchPrimitive.Control>
    </>
  )
}

type SwitchThumbProps = SwitchPrimitive.SwitchThumbProps & { class?: string | undefined }

const SwitchThumb = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, SwitchThumbProps>
) => {
  const [local, others] = splitProps(props as SwitchThumbProps, ['class'])
  return (
    <SwitchPrimitive.Thumb
      class={cn(
        'bg-background pointer-events-none block size-5 translate-x-0 rounded-full shadow-lg ring-0 transition-transform data-[checked]:translate-x-5',
        local.class
      )}
      {...others}
    />
  )
}

type SwitchLabelProps = SwitchPrimitive.SwitchLabelProps & { class?: string | undefined }

const SwitchLabel = <T extends ValidComponent = 'label'>(
  props: PolymorphicProps<T, SwitchLabelProps>
) => {
  const [local, others] = splitProps(props as SwitchLabelProps, ['class'])
  return (
    <SwitchPrimitive.Label
      class={cn(
        'text-sm leading-none font-medium data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70',
        local.class
      )}
      {...others}
    />
  )
}

export { Switch, SwitchControl, SwitchDescription, SwitchErrorMessage, SwitchLabel, SwitchThumb }

// ---

type SwitchCompProps = ComponentProps<typeof Switch> & {
  label?: JSX.Element
  controlProps?: SwitchControlProps
  thumbProps?: SwitchThumbProps
  labelProps?: SwitchLabelProps
}

const SwitchComp = (props: SwitchCompProps) => {
  const [local, others] = splitProps(props, ['label', 'controlProps', 'thumbProps', 'labelProps'])

  const label = children(() => local.label)

  return (
    <SwitchPrimitive.Root class={cn('flex items-center space-x-2', others.class)} {...others}>
      <SwitchControl {...local.controlProps}>
        <SwitchThumb {...local.thumbProps} />
      </SwitchControl>
      <Show when={label()}>
        <SwitchLabel {...local.labelProps}>{label()}</SwitchLabel>
      </Show>
    </SwitchPrimitive.Root>
  )
}

export { SwitchComp }
