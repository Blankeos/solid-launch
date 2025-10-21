import { createField, type DeepKeys, type FieldApi } from "@tanstack/solid-form"
import { CheckboxComp } from "@/components/ui/checkbox"

interface CheckboxFieldProps<TParentData, TName extends DeepKeys<TParentData>> {
  form: FieldApi<TParentData, TName>
  label?: string
  required?: boolean
}

export function CheckboxField<TParentData, TName extends DeepKeys<TParentData>>(
  props: CheckboxFieldProps<TParentData, TName>
) {
  const field = createField(() => ({
    ...props.form,
    name: props.form.name,
  }))

  return (
    <CheckboxComp
      id={props.form.name as string}
      checked={field().state.value as boolean}
      onChange={(checked) => field().setValue(checked)}
      onBlur={field().handleBlur}
      required={props.required}
      label={props.label}
    />
  )
}
