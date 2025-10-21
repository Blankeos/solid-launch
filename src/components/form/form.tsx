import { createFormHook, createFormHookContexts } from "@tanstack/solid-form"
import { TextField } from "./text-field"

// ===========================================================================
// 1. Form Context
// ===========================================================================
export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

// ===========================================================================
// 2. Form Hook
// ===========================================================================
export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    // CheckboxField,
    // RadioGroupField,
    // SelectField,
  },
  formComponents: {},
  fieldContext,
  formContext,
})
