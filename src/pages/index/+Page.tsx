import { createSignal } from 'solid-js';
import { IconSolid } from '@/assets/icons';
import { toast } from 'solid-sonner';
import { useCounterContext } from '@/stores/counter.context';

export default function HomePage() {
  const [count, setCount] = createSignal(0);

  const { count: globalCount, setCount: setGlobalCount } = useCounterContext();

  return (
    <div class="flex h-full flex-1 flex-col">
      <div class="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-y-5 px-8">
        <div class="flex">
          <a href="https://vitejs.dev" target="_blank">
            <img src="/vite.svg" class="logo" alt="Vite logo" />
          </a>
          <a href="https://solidjs.com" target="_blank">
            <IconSolid width={40} height={40} />
          </a>
        </div>

        <h1 class="text-3xl font-medium">Vite + Solid</h1>

        <div class="flex flex-col items-center justify-center gap-x-2 gap-y-2">
          <div class="flex gap-x-2">
            <button
              class="rounded border border-blue-300 bg-blue-500 px-5 py-2 text-white"
              onClick={() => setCount((count) => count + 1)}
            >
              ☝️ count is {count()}
            </button>

            <button
              class="rounded border border-blue-300 bg-blue-500 px-5 py-2 text-white"
              onClick={() => setGlobalCount((count) => count + 1)}
            >
              🌎 global count is {globalCount()}
            </button>

            <button
              class="rounded border border-blue-300 px-5 py-2 text-blue-500"
              onClick={() => toast('🍞 Awesome!')}
            >
              🍞 Show a Toast
            </button>
          </div>

          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
      </div>
    </div>
  );
}
