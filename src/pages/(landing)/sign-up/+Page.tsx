import { useMetadata } from "vike-metadata-solid"
import { Separator } from "@/components/ui/separator"
import { EmailAndPasswordSignupForm } from "@/features/auth/forms/email-and-password-signup-form"
import { MagicLinkForm } from "@/features/auth/forms/magic-link-form"
import { OAuthButtons } from "@/features/auth/forms/oauth-buttons"
import { OTPForm } from "@/features/auth/forms/otp-form"
import getTitle from "@/utils/get-title"

export default function SignUpPage() {
  useMetadata({
    title: getTitle("Sign Up"),
  })

  return (
    <div class="flex h-full flex-1 flex-col">
      <div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-y-5">
        <h1 class="font-medium text-3xl">Sign Up</h1>

        <EmailAndPasswordSignupForm />

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
