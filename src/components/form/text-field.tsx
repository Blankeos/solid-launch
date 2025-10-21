import { type JSX, splitProps } from "solid-js"
import { TextFieldComp, type TextFieldCompProps } from "@/components/ui/text-field"
import { useFieldContext } from "./form"

export function TextField(
  props: {
    containerClass?: string
    /** A way to customize rendering the input element (add a button next to it, etc.) */
    inputNodeFn?: (options: { inputNode: JSX.Element }) => JSX.Element
    /** A description to display below the field */
    description?: JSX.Element
  } & TextFieldCompProps<"input">
) {
  const [, others] = splitProps(props, [
    "label",
    "containerClass",
    "inputNodeFn",
    "description",
    "onChange",
    "onBlur",
  ])
  const field = useFieldContext<string>()

  return (
    <div class={props.containerClass}>
      <TextFieldComp
        class={props.class}
        label={props.label}
        onChange={field().handleChange}
        onBlur={field().handleBlur}
        error={field()
          .getMeta()
          .errors?.map((error) => error.message)
          ?.join(", ")}
        validationState={field().getMeta().errors?.length > 0 ? "invalid" : "valid"}
        multiline={false}
        value={field().state.value}
        {...others}
      />
    </div>
  )
}
