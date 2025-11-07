import { toast } from "solid-sonner"
import { navigate } from "vike/client/router"
import { z } from "zod"
import { TextField, useAppForm } from "@/components/form"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "../auth.context"
import { usePostLoginRedirectUrl } from "../use-post-login-redirect-url"

export function EmailAndPasswordSignupForm() {
  const postLoginRedirectUrl = usePostLoginRedirectUrl()
  const { emailRegister } = useAuthContext()

  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })

  const form = useAppForm(() => ({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      toast.promise(
        async () => {
          const result = await emailRegister.run({
            email: value.email,
            password: value.password,
          })

          if (result) navigate(postLoginRedirectUrl())
        },
        {
          error: "Failed to register",
          success: "Registered!",
          loading: "Registering...",
        }
      )
    },
  }))

  return (
    <form
      class="flex w-full max-w-xs flex-col gap-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.AppField name="email">{(_field) => <TextField label="Email" />}</form.AppField>

      <form.AppField name="password">
        {(_field) => <TextField label="Password" type="password" />}
      </form.AppField>

      <Button
        type="submit"
        class="rounded border border-blue-300 bg-blue-500 px-5 py-2 text-white"
        loading={emailRegister.loading()}
      >
        Register
      </Button>
    </form>
  )
}
