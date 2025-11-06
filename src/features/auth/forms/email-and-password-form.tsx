import { toast } from "solid-sonner"
import { navigate } from "vike/client/router"
import { z } from "zod"
import { TextField, useAppForm } from "@/components/form"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/features/auth/auth.context"
import { usePostLoginRedirectUrl } from "@/features/auth/use-post-login-redirect-url"

export function EmailAndPasswordLoginForm() {
  const { emailLogin: login } = useAuthContext()
  const postLoginRedirectUrl = usePostLoginRedirectUrl()

  const schema = z.object({
    email: z.string().min(3),
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
          const result = await login.run({
            email: value.email,
            password: value.password,
          })

          if (result) navigate(postLoginRedirectUrl())
        },
        {
          error: (err) => `Failed to login: ${err.message}`,
          success: "Logged in",
          loading: "Logging in...",
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
        loading={login.loading()}
      >
        Login
      </Button>
    </form>
  )
}
