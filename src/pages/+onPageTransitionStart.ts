import { BProgress } from "@bprogress/core"

export async function onPageTransitionStart() {
  BProgress.start()
}
