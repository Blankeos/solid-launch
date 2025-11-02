import { useMetadata } from "vike-metadata-solid"
import { Button } from "@/components/ui/button"
import { useCounterContext } from "@/contexts/counter.context"

export default function AboutPage() {
  const { count: globalCount, setCount: setGlobalCount } = useCounterContext()

  useMetadata({
    title: "About | Solid Launch",
  })

  return (
    <div class="flex h-full flex-1 flex-col">
      <div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-y-5">
        <h1 class="font-medium text-3xl">About</h1>
        <Button onClick={() => setGlobalCount((count) => count + 1)}>
          🌎 global count is {globalCount()}
        </Button>
      </div>
    </div>
  )
}
