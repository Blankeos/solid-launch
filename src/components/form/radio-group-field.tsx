import { createField, type DeepKeys, type FieldApi } from "@tanstack/solid-form"
import { Label } from "@/components/ui/label"
import { RadioGroupComp, type RadioGroupOption } from "@/components/ui/radio-group"

interface RadioGroupFieldProps<TParentData, TName extends DeepKeys<TParentData>> {
  form: FieldApi<TParentData, TName, TFieldValidator>
  label?: string
  options: RadioGroupOption[]
  required?: boolean
}

export function RadioGroupField<TParentData, TName extends DeepKeys<TParentData>>(
  props: RadioGroupFieldProps<TParentData, TName, TFieldValidator>
) {
  const field = createField(() => ({
    ...props.form,
    name: props.form.name,
  }))

  return (
    <div class="flex flex-col gap-2">
      {props.label && (
        <Label>
          {props.label}
          {props.required && <span class="text-red-500"> *</span>}
        </Label>
      )}
      <RadioGroupComp
        value={field().state.value as string}
        onChange={(value) => field().setValue(value)}
        options={props.options}
        required={props.required}
      />
      {field().state.meta.errors.length > 0 && (
        <p class="text-red-500 text-sm">{field().state.meta.errors.join(", ")}</p>
      )}
    </div>
  )
}
