import { Label } from "@/components/ui/label"
import { SelectComp, type SelectOption } from "@/components/ui/select"
import { useFieldContext } from "./form"

export function SelectField(props: {
  label?: string
  placeholder?: string
  options: SelectOption[]
  required?: boolean
}) {
  const field = useFieldContext<SelectOption | null>()

  return (
    <div class="flex flex-col gap-2">
      {props.label && (
        <Label for={field().name as string}>
          {props.label}
          {props.required && <span class="text-red-500"> *</span>}
        </Label>
      )}
      <SelectComp
        name={field().name as string}
        value={field().state.value}
        onChange={(value) => field().handleChange(value)}
        onBlur={field().handleBlur}
        required={props.required}
        options={props.options}
        placeholder={props.placeholder}
        triggerProps={{
          class: "w-full",
        }}
      />
      {field().state.meta.errors && field().state.meta.errors.length > 0 && (
        <p class="text-red-500 text-sm">
          {field()
            .state.meta.errors.map((error: any) => error.message || error)
            .join(", ")}
        </p>
      )}
    </div>
  )
}
