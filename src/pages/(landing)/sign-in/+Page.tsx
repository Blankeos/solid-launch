import { IconGitHub, IconGoogle } from '@/assets/icons'
import { TextField, useAppForm } from '@/components/form'
import { Button } from '@/components/ui/button'
import { getRoute } from '@/route-tree.gen'
import { useAuthContext } from '@/stores/auth.context'
import { useCounterContext } from '@/stores/counter.context'
import getTitle from '@/utils/get-title'
import { toast } from 'solid-sonner'
import { useMetadata } from 'vike-metadata-solid'
import { navigate } from 'vike/client/router'
import { z } from 'zod'

export default function SignInPage() {
  useMetadata({
    title: getTitle('Sign In'),
  })

  const { count: globalCount, setCount: setGlobalCount } = useCounterContext()

  const { login, githubLogin, googleLogin } = useAuthContext()

  const schema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
  })

  const form = useAppForm(() => ({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      // onChange: schema,
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      toast.promise(
        async () => {
          const result = await login.run({
            username: value.username,
            password: value.password,
          })

          if (result) navigate(getRoute('/dashboard'))
        },
        {
          error: 'Failed to login',

          success: 'Logged in',
          loading: 'Logging in...',
        }
      )
    },
  }))
  const data = form.useStore()

  const handleGithubLogin = () => {
    toast.promise(
      async () => {
        const result = await githubLogin.run()
        if (result) navigate(getRoute('/dashboard'))
      },
      {
        error: 'Failed to login with GitHub',
        success: 'Logged in with GitHub',
        loading: 'Logging in with GitHub...',
      }
    )
  }

  const handleGoogleLogin = () => {
    toast.promise(
      async () => {
        const result = await googleLogin.run()
        if (result) navigate(getRoute('/dashboard'))
      },
      {
        error: 'Failed to login with Google',
        success: 'Logged in with Google',
        loading: 'Logging in with Google...',
      }
    )
  }

  return (
    <div class="flex h-full flex-1 flex-col">
      <div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-y-5">
        <h1 class="text-3xl font-medium">Sign In</h1>
        <Button onClick={() => setGlobalCount((count) => count + 1)}>
          🌎 global count is {globalCount()}
        </Button>

        <form
          class="flex w-full max-w-xs flex-col gap-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.AppField name="username">
            {(_field) => <TextField label="Username" />}
          </form.AppField>

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
