import { createSignal, Show } from "solid-js"
import { toast } from "solid-sonner"
import { navigate } from "vike/client/router"
import { Button } from "@/components/ui/button"
import { TextFieldComp } from "@/components/ui/text-field"
import { useAuthContext } from "../auth.context"
import { usePostLoginRedirectUrl } from "../use-post-login-redirect-url"

export function OTPForm() {
  const { otpVerify, otpSend } = useAuthContext()
  const [code, setCode] = createSignal("")
  const [hasSent, setHasSent] = createSignal(false)
  const [email, setEmail] = createSignal("")

  const postLoginRedirectUrl = usePostLoginRedirectUrl()

  const handleOTPSend = async () => {
    toast.promise(
      async () => {
        const result = await otpSend.run({ email: email() })
        if (result?.success) {
          setHasSent(true)
        }
      },
      {
        error: (err) => `Failed to send OTP: ${err.message}`,
        success: "OTP sent! Check your email.",
        loading: "Sending OTP...",
      }
    )
  }

  const handleOTPVerify = async () => {
    toast.promise(
      async () => {
        const result = await otpVerify.run({ identifier: email(), code: code() })
        if (result) navigate(postLoginRedirectUrl())
      },
      {
        error: (err) => `Failed to verify OTP: ${err.message}`,
        success: "Logged in",
        loading: "Verifying OTP...",
      }
    )
  }

  return (
    <div class="flex w-full max-w-xs flex-col gap-y-3">
      <TextFieldComp label="Email" value={email()} onChange={setEmail} />
      <Show
        when={hasSent()}
        fallback={
          <Button onClick={handleOTPSend} loading={otpSend.loading()}>
            Send OTP
          </Button>
        }
      >
        <TextFieldComp label="OTP Code" value={code()} onChange={setCode} placeholder="123456" />
        <Button onClick={handleOTPVerify} loading={otpVerify.loading()}>
          Verify OTP
        </Button>
      </Show>
    </div>
  )
}
