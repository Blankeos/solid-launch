import { useMetadata } from "vike-metadata-solid"
import { Separator } from "@/components/ui/separator"
import { useCounterContext } from "@/contexts/counter.context"
import { EmailAndPasswordLoginForm } from "@/features/auth/forms/email-and-password-form"
import { MagicLinkForm } from "@/features/auth/forms/magic-link-form"
import { OAuthButtons } from "@/features/auth/forms/oauth-buttons"
import { OTPForm } from "@/features/auth/forms/otp-form"
import { usePostLoginRedirectUrl } from "@/features/auth/use-post-login-redirect-url"
import getTitle from "@/utils/get-title"

export default function SignInPage() {
  useMetadata({
    title: getTitle("Sign In"),
  })

  const postLoginRedirectUrl = usePostLoginRedirectUrl()

  const { count: globalCount, setCount: setGlobalCount } = useCounterContext()

  return (
    <div class="flex h-full flex-1 flex-col">
      <div class="mx-auto flex w-full max-w-xl flex-col items-center gap-y-5">
        <h1 class="font-medium text-3xl">Sign In</h1>

        <EmailAndPasswordLoginForm />

        <Separator />

        <OAuthButtons />

        <Separator />

        <OTPForm />

        <Separator />

        <MagicLinkForm />
      </div>
    </div>
  )
}
