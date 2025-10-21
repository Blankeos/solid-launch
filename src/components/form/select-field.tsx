import { createField, type DeepKeys, type FieldApi } from "@tanstack/solid-form"
import { Label } from "@/components/ui/label"
import { SelectComp, type SelectOption } from "@/components/ui/select"

interface SelectFieldProps<TParentData, TName extends DeepKeys<TParentData>> {
  form: FieldApi<TParentData, TName>
  label?: string
  placeholder?: string
  options: SelectOption[]
  required?: boolean
}

export function SelectField<TParentData, TName extends DeepKeys<TParentData>>(
  props: SelectFieldProps<TParentData, TName>
) {
  const field = createField(() => ({
    ...props.form,
    name: props.form.name,
  }))

  return (
    <div class="flex flex-col gap-2">
      {props.label && (
        <Label for={props.form.name as string}>
          {props.label}
          {props.required && <span class="text-red-500"> *</span>}
        </Label>
      )}
      <SelectComp
        name={props.form.name as string}
        value={field().state.value as string}
        onChange={(value) => field().setValue(value)}
        onBlur={field().handleBlur}
        required={props.required}
        options={props.options}
        placeholder={props.placeholder}
        triggerProps={{
          class: "w-full",
        }}
      />
      {field().state.meta.errors.length > 0 && (
        <p class="text-red-500 text-sm">{field().state.meta.errors.join(", ")}</p>
      )}
    </div>
  )
}
