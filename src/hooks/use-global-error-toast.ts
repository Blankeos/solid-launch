import { onMount } from "solid-js"
import { toast } from "solid-sonner"

/** Fires a toast for cases like redirects that have errors. */
export function useGlobalErrorToast() {
  onMount(() => {
    const url = new URL(window.location.href)
    const error = url.searchParams.get("error")
    if (error) {
      // For some weird reason, if I don't do this, it doesn't show.
      // Maybe because this hook gets called before <Toaster /> initializes.
      setTimeout(() => {
        toast.error(error)
        url.searchParams.delete("error")
        window.history.replaceState({}, "", url.toString())
      }, 200)
    }
  })
}
