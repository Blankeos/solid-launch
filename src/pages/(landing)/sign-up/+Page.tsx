import { toast } from "solid-sonner"
import { navigate } from "vike/client/router"
import { useMetadata } from "vike-metadata-solid"
import { z } from "zod"
import { IconGitHub, IconGoogle } from "@/assets/icons"
import { TextField, useAppForm } from "@/components/form"
import { Button } from "@/components/ui/button"
import { useCounterContext } from "@/contexts/counter.context"
import { useAuthContext } from "@/features/auth/auth.context"
import { usePostLoginRedirectUrl } from "@/features/auth/use-post-login-redirect-url"
import getTitle from "@/utils/get-title"

export default function SignUpPage() {
  useMetadata({
    title: getTitle("Sign Up"),
  })

  const postLoginRedirectUrl = usePostLoginRedirectUrl()

  const { count, setCount } = useCounterContext()

  const { emailRegister: register, githubLogin, googleLogin } = useAuthContext()

  const schema = z.object({
    email: z.email(),
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
          const result = await register.run({
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
  const data = form.useStore()

  const handleGithubLogin = () => {
    toast.promise(
      async () => {
        const result = await githubLogin.run({})
        if (result) navigate(postLoginRedirectUrl())
      },
      {
        error: "Failed to login with GitHub",
        success: "Logged in with GitHub",
        loading: "Logging in with GitHub...",
      }
    )
  }

  const handleGoogleLogin = () => {
    toast.promise(
      async () => {
        const result = await googleLogin.run({})
        if (result) navigate(postLoginRedirectUrl())
      },
      {
        error: "Failed to login with Google",
        success: "Logged in with Google",
        loading: "Logging in with Google...",
      }
    )
  }

  return (
    <div class="flex h-full flex-1 flex-col">
      <div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-y-5">
        <h1 class="font-medium text-3xl">Sign Up</h1>
        <Button onClick={() => setCount((count) => count + 1)}>🌎 global count is {count()}</Button>
        <form
          class="flex w-full max-w-xs flex-col gap-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.AppField name="email">
            {(_field) => <TextField label="Email" type="email" />}
          </form.AppField>

          <form.AppField name="password">
            {(_field) => <TextField label="Password" type="password" />}
          </form.AppField>

          <Button
            type="submit"
            class="rounded border border-blue-300 bg-blue-500 px-5 py-2 text-white"
            loading={register.loading()}
          >
            Register
          </Button>
        </form>
        <div class="flex gap-x-3">
          <Button
            onClick={handleGithubLogin}
            loading={githubLogin.loading()}
            variant="outline"
            class="bg-white"
          >
            <IconGitHub />
          </Button>

          <Button onClick={handleGoogleLogin} loading={googleLogin.loading()} variant="outline">
            <IconGoogle />
          </Button>
        </div>
        <pre class="rounded-md border border-gray-500 bg-gray-900 p-3 text-white">
          {JSON.stringify(data().values, null, 2)}
        </pre>
        <pre class="rounded-md border border-gray-500 bg-gray-900 p-3 text-white">
          {JSON.stringify(data().errors, null, 2)}
        </pre>
      </div>
    </div>
  )
}
