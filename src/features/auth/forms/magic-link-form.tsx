import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
import { TextFieldComp } from "@/components/ui/text-field"
import { useAuthContext } from "../auth.context"

export function MagicLinkForm() {
  const { magicLinkSend } = useAuthContext()
  const [hasSent, setHasSent] = createSignal(false)
  const [email, setEmail] = createSignal("")

  const handleMagicLinkSend = async () => {
    toast.promise(
      async () => {
        const result = await magicLinkSend.run({ email: email() })
        if (result?.success) {
          setHasSent(true)
        }
      },
      {
        error: (err) => `Failed to send magic link: ${err.message}`,
        success: "Magic link sent! Check your email.",
        loading: "Sending magic link...",
      }
    )
  }

  return (
    <div class="flex w-full max-w-xs flex-col gap-y-3">
      <TextFieldComp label="Email" value={email()} onChange={setEmail} />
      <Show
        when={hasSent()}
        fallback={
          <Button onClick={handleMagicLinkSend} loading={magicLinkSend.loading()}>
            Send Magic Link
          </Button>
        }
      >
        <p class="text-muted-foreground text-sm">
          Please check your email. The magic link is valid for 2 minutes.
        </p>
      </Show>
    </div>
  )
}
