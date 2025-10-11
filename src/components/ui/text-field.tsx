import type { JSX, ValidComponent } from 'solid-js'
import { createSignal, mergeProps, splitProps } from 'solid-js'

import type { PolymorphicProps } from '@kobalte/core'
import * as TextFieldPrimitive from '@kobalte/core/text-field'
import { cva } from 'class-variance-authority'

import { IconEye, IconEyeOff } from '@/assets/icons'
import { cn } from '@/utils/cn'

type TextFieldRootProps<T extends ValidComponent = 'div'> =
  TextFieldPrimitive.TextFieldRootProps<T> & {
    class?: string | undefined
  }

const TextField = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TextFieldRootProps<T>>
) => {
  const [local, others] = splitProps(props as TextFieldRootProps, ['class'])
  return <TextFieldPrimitive.Root class={cn('flex flex-col gap-1.5', local.class)} {...others} />
}

type TextFieldInputProps<T extends ValidComponent = 'input'> =
  TextFieldPrimitive.TextFieldInputProps<T> & {
    class?: string | undefined
    type?:
      | 'button'
      | 'checkbox'
      | 'color'
      | 'date'
      | 'datetime-local'
      | 'email'
      | 'file'
      | 'hidden'
      | 'image'
      | 'month'
      | 'number'
      | 'password'
      | 'radio'
      | 'range'
      | 'reset'
      | 'search'
      | 'submit'
      | 'tel'
      | 'text'
      | 'time'
      | 'url'
      | 'week'
  }

const TextFieldInput = <T extends ValidComponent = 'input'>(
  rawProps: PolymorphicProps<T, TextFieldInputProps<T>>
) => {
  const props = mergeProps<TextFieldInputProps<T>[]>({ type: 'text' }, rawProps)
  const [local, others] = splitProps(props as TextFieldInputProps, ['type', 'class'])
  return (
    <TextFieldPrimitive.Input
      type={local.type}
      class={cn(
        'border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring data-[invalid]:border-error-foreground data-[invalid]:text-error-foreground flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        local.class
      )}
      {...others}
    />
  )
}

type TextFieldTextAreaProps<T extends ValidComponent = 'textarea'> =
  TextFieldPrimitive.TextFieldTextAreaProps<T> & { class?: string | undefined }

const TextFieldTextArea = <T extends ValidComponent = 'textarea'>(
  props: PolymorphicProps<T, TextFieldTextAreaProps<T>>
) => {
  const [local, others] = splitProps(props as TextFieldTextAreaProps, ['class'])
  return (
    <TextFieldPrimitive.TextArea
      class={cn(
        'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        local.class
      )}
      {...others}
    />
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

type TextFieldLabelProps<T extends ValidComponent = 'label'> =
  TextFieldPrimitive.TextFieldLabelProps<T> & { class?: string | undefined }

const TextFieldLabel = <T extends ValidComponent = 'label'>(
  props: PolymorphicProps<T, TextFieldLabelProps<T>>
) => {
  const [local, others] = splitProps(props as TextFieldLabelProps, ['class'])
  return <TextFieldPrimitive.Label class={cn(labelVariants(), local.class)} {...others} />
}

type TextFieldDescriptionProps<T extends ValidComponent = 'div'> =
  TextFieldPrimitive.TextFieldDescriptionProps<T> & {
    class?: string | undefined
  }

const TextFieldDescription = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TextFieldDescriptionProps<T>>
) => {
  const [local, others] = splitProps(props as TextFieldDescriptionProps, ['class'])
  return (
    <TextFieldPrimitive.Description
      class={cn(labelVariants({ variant: 'description' }), local.class)}
      {...others}
    />
  )
}

type TextFieldErrorMessageProps<T extends ValidComponent = 'div'> =
  TextFieldPrimitive.TextFieldErrorMessageProps<T> & {
    class?: string | undefined
  }

const TextFieldErrorMessage = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TextFieldErrorMessageProps<T>>
) => {
  const [local, others] = splitProps(props as TextFieldErrorMessageProps, ['class'])
  return (
    <TextFieldPrimitive.ErrorMessage
      class={cn(labelVariants({ variant: 'error' }), local.class)}
      {...others}
    />
  )
}

export {
  TextField,
  TextFieldDescription,
  TextFieldErrorMessage,
  TextFieldInput,
  TextFieldLabel,
  TextFieldTextArea,
}

// ---

export type TextFieldCompProps<T extends ValidComponent = 'div'> = TextFieldRootProps<T> & {
  // input
  type?: TextFieldInputProps['type']
  // label
  label?: string | undefined
  // description
  description?: string | undefined
  // error
  error?: string | undefined
  // textarea
  multiline?: boolean | undefined
  // blur handler
  onBlur?: JSX.EventHandlerUnion<HTMLInputElement | HTMLTextAreaElement, FocusEvent> | undefined
}

const TextFieldComp = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TextFieldCompProps<T>>
) => {
  const [isPasswordVisible, setIsPasswordVisible] = createSignal(false)
  const [local, others] = splitProps(props as TextFieldCompProps, [
    'class',
    'type',
    'label',
    'description',
    'error',
    'multiline',
    'onBlur',
  ])

  const isPassword = () => local.type === 'password'
  const inputType = () => (isPassword() && isPasswordVisible() ? 'text' : local.type)

  return (
    <TextField class={local.class} {...others}>
      <TextFieldLabel>{local.label}</TextFieldLabel>
      {local.multiline ? (
        <TextFieldTextArea onBlur={local.onBlur} />
      ) : (
        <div class="relative">
          <TextFieldInput type={inputType()} onBlur={local.onBlur} />
          {isPassword() && (
            <button
              tabIndex={-1}
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
              disabled={others.disabled}
            >
              {isPasswordVisible() ? <IconEyeOff /> : <IconEye />}
            </button>
          )}
        </div>
      )}
      <TextFieldDescription>{local.description}</TextFieldDescription>
      <TextFieldErrorMessage>{local.error}</TextFieldErrorMessage>
    </TextField>
  )
}

export { TextFieldComp }
