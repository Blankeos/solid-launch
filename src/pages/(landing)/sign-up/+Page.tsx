import { getRoute } from '@/route-tree.gen';
import { useAuthContext } from '@/stores/auth.context';
import { useCounterContext } from '@/stores/counter.context';
import getTitle from '@/utils/get-title';
import { createForm } from '@felte/solid';
import { validator } from '@felte/validator-zod';
import { toast } from 'solid-sonner';
import { useMetadata } from 'vike-metadata-solid';
import { navigate } from 'vike/client/router';
import { z } from 'zod';

export default function SignUpPage() {
  useMetadata({
    title: getTitle('Sign Up'),
  });

  const { count: globalCount, setCount: setGlobalCount } = useCounterContext();

  const { register } = useAuthContext();

  const schema = z.object({
    username: z.string(),
    password: z.string(),
  });

  const { form, data } = createForm({
    extend: validator({ schema }),
    onSubmit: async (values: typeof schema._type) => {
      toast.promise(
        async () => {
          const result = await register(values.username, values.password);

          if (result) {
            navigate(getRoute('/dashboard'));
          }
        },
        {
          error: 'Failed to register',
          success: 'Registered!',
          loading: 'Registering...',
        }
      );
    },
  });

  return (
    <div class="flex h-full flex-1 flex-col">
      <div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-y-5">
        <h1 class="text-3xl font-medium">Sign Up</h1>
        <button
          class="rounded border border-blue-300 bg-blue-500 px-5 py-2 text-white"
          onClick={() => setGlobalCount((count) => count + 1)}
        >
          🌎 global count is {globalCount()}
        </button>

        <form use:form={form} class="flex flex-col gap-y-3">
          <div class="flex flex-col">
            <label>Username</label>
            <input name="username" class="rounded border p-2" type="text" />
          </div>
          <div class="flex flex-col">
            <label>Password</label>
            <input name="password" class="rounded border p-2" type="password" />
          </div>

          <button
            type="submit"
            class="rounded border border-blue-300 bg-blue-500 px-5 py-2 text-white"
          >
            Register
          </button>
        </form>

        <pre class="rounded-md border border-gray-500 bg-gray-900 p-3 text-white">
          {JSON.stringify(data(), null, 2)}
        </pre>
      </div>
    </div>
  );
}
