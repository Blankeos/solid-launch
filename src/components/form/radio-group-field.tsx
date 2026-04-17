import { Label } from "@/components/ui/label"
import { RadioGroupComp, type RadioGroupOption } from "@/components/ui/radio-group"
import { useFieldContext } from "./context"

export function RadioGroupField(props: {
  label?: string
  options: RadioGroupOption[]
  required?: boolean
}) {
  const field = useFieldContext<string>()

  return (
    <div class="flex flex-col gap-2">
      {props.label && (
        <Label>
          {props.label}
          {props.required && <span class="text-red-500"> *</span>}
        </Label>
      )}
      <RadioGroupComp
        value={field().state.value}
        onChange={(value) => field().handleChange(value)}
        options={props.options}
        required={props.required}
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
