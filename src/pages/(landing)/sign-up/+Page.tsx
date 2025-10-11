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

export default function SignUpPage() {
  useMetadata({
    title: getTitle('Sign Up'),
  })

  const { count: globalCount, setCount: setGlobalCount } = useCounterContext()

  const { register } = useAuthContext()

  const schema = z.object({
    username: z.string(),
    password: z.string(),
  })

  const form = useAppForm({
    defaultValues: () => ({
      username: '',
      password: '',
    }),
    onSubmit: async (values) => {
      toast.promise(
        async () => {
          const result = await register(values.username, values.password)

          if (result) {
            navigate(getRoute('/dashboard'))
          }
        },
        {
          error: 'Failed to register',
          success: 'Registered!',
          loading: 'Registering...',
        }
      )
    },
  })

  return (
    <div class="flex h-full flex-1 flex-col">
      <div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-y-5">
        <h1 class="text-3xl font-medium">Sign Up</h1>
        <Button class="rounded border border-blue-300 bg-blue-500 px-5 py-2 text-white">
          🌎 global count is {globalCount()}
        </Button>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          class="flex flex-col gap-y-3"
        >
          <form.Field name="username">
            {(field) => (
              <TextField form={field} label="Username" placeholder="Enter your username" required />
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <TextField
                form={field}
                label="Password"
                type="password"
                placeholder="Enter your password"
                required
              />
            )}
          </form.Field>

          <button
            type="submit"
            class="rounded border border-blue-300 bg-blue-500 px-5 py-2 text-white"
          >
            Register
          </button>
        </form>

        <pre class="rounded-md border border-gray-500 bg-gray-900 p-3 text-white">
          {JSON.stringify(form.state.values, null, 2)}
        </pre>
      </div>
    </div>
  )
}
