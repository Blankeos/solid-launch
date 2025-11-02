import { createSignal } from "solid-js"
import { toast } from "solid-sonner"
import { useMetadata } from "vike-metadata-solid"
import { IconSolid } from "@/assets/icons"
import { Button } from "@/components/ui/button"
import { useCounterContext } from "@/contexts/counter.context"
import { getRoute } from "@/route-tree.gen"

export default function HomePage() {
  const [count, setCount] = createSignal(0)

  const { count: globalCount, setCount: setGlobalCount } = useCounterContext()

  useMetadata({})

  return (
    <div class="flex h-full flex-1 flex-col">
      <div class="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-y-5 px-8">
        <div class="flex">
          <a href="https://vitejs.dev" target="_blank" rel="noopener">
            <img src="/vite.svg" class="logo" alt="Vite logo" />
          </a>
          <a href="https://solidjs.com" target="_blank" rel="noopener">
            <IconSolid width={40} height={40} />
          </a>
        </div>

        <h1 class="font-medium text-3xl">Vite + Solid</h1>

        <div class="flex flex-col items-center justify-center gap-x-2 gap-y-2">
          <div class="flex flex-wrap justify-center gap-2">
            <Button onClick={() => setCount((count) => count + 1)}>☝️ count is {count()}</Button>

            <Button variant="secondary" onClick={() => setGlobalCount((count) => count + 1)}>
              🌎 global count is {globalCount()}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const toasts = [
                  () => toast("🍞 Awesome!"),
                  () =>
                    toast.promise(
                      async () => {
                        const random = Math.floor(Math.random() * 2)

                        if (random === 0) await new Promise((resolve) => setTimeout(resolve, 2000))
                        if (random === 1)
                          await new Promise((resolve, reject) => setTimeout(reject, 2000))
                      },
                      {
                        loading: "🍞 Cooking your toast...",
                        success: "🍔 Toast cooked!",
                        error: "☄️ Toast failed!",
                      }
                    ),
                  async () => {
                    const toastIdAlphabet = "abcdefghijklmnopqrstuvwxyz1234567890"
                    const toastId = [...Array(5)].reduce(
                      (acc, _) =>
                        acc + toastIdAlphabet[Math.floor(Math.random() * toastIdAlphabet.length)],
                      ""
                    )
                    toast.loading("🔪 Slicing your toast...", { id: toastId })
                    await new Promise((resolve) => setTimeout(resolve, 800))
                    toast.loading("🤺 Slicing EVEN HARDER!!!", { id: toastId })
                    await new Promise((resolve) => setTimeout(resolve, 800))
                    toast.loading("💣 It's GONNA BLOW!!!", { id: toastId })
                    await new Promise((resolve) => setTimeout(resolve, 500))

                    toast.promise(
                      async () => {
                        const random = Math.floor(Math.random() * 2)

                        if (random === 0) await new Promise((resolve) => setTimeout(resolve, 2000))
                        if (random === 1)
                          await new Promise((resolve, reject) => setTimeout(reject, 2000))
                      },
                      {
                        loading: "👨‍🍳 Cooking EVEN HARDER!!!",
                        success: "🍔 Toast cooked!",
                        error: "☄️ Toast BURNT!",
                        id: toastId,
                      }
                    )
                  },
                ]

                const random = Math.floor(Math.random() * toasts.length)

                toasts[random]()
              }}
            >
              🍞 Show a Toast
            </Button>
            <Button variant="outline" as="a" href={getRoute("/_components")}>
              Browse Components
            </Button>
          </div>

          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
      </div>
    </div>
  )
}
