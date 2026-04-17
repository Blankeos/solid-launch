import { createFormHook } from "@tanstack/solid-form"
import { CheckboxField } from "./checkbox-field"
import { fieldContext, formContext } from "./context"
import { RadioGroupField } from "./radio-group-field"
import { SelectField } from "./select-field"
import { TextField } from "./text-field"

export { fieldContext, formContext, useFieldContext, useFormContext } from "./context"

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    CheckboxField,
    RadioGroupField,
    SelectField,
  },
  formComponents: {},
  fieldContext,
  formContext,
})
