import { CheckboxComp } from "@/components/ui/checkbox"
import { useFieldContext } from "./context"

export function CheckboxField(props: { label?: string; required?: boolean }) {
  const field = useFieldContext<boolean>()

  return (
    <CheckboxComp
      id={field().name as string}
      checked={field().state.value}
      onChange={(checked) => field().handleChange(checked)}
      onBlur={field().handleBlur}
      required={props.required}
      label={props.label}
    />
  )
}
