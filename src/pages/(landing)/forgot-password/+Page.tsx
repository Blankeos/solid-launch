// import { createSignal, Show } from "solid-js"
// import { toast } from "solid-sonner"
// import { navigate } from "vike/client/router"
// import { useMetadata } from "vike-metadata-solid"
// import { z } from "zod"
// import { Button } from "@/components/ui/button"
// import { TextFieldComp } from "@/components/ui/text-field"
// import { useAuthContext } from "@/features/auth/auth.context"
// import { usePostLoginRedirectUrl } from "@/features/auth/use-post-login-redirect-url"
// import getTitle from "@/utils/get-title"

// function EmailForm(props: { onSent: (email: string) => void }) {
//   const { forgotPasswordVerify } = useAuthContext()
//   const [email, setEmail] = createSignal("")

//   const handleSendReset = () => {
//     toast.promise(
//       async () => {
//         await forgotPasswordVerify.run({ newPassword: ,  token:  })
//         props.onSent(email())
//       },
//       {
//         error: (err) => `Failed to send reset email: ${err.message}`,
//         success: "Reset link sent! Check your email.",
//         loading: "Sending reset link...",
//       }
//     )
//   }

//   return (
//     <div class="flex w-full max-w-xs flex-col gap-y-3">
//       <TextFieldComp label="Email" value={email()} onChange={setEmail} type="email" />
//       <Button onClick={handleSendReset} loading={passwordResetSend.loading()}>
//         Send Reset Link
//       </Button>
//     </div>
//   )
// }

// function ResetForm(props: { email: string }) {
//   const [password, setPassword] = createSignal("")
//   const [token, setToken] = createSignal("")
//   const { passwordResetConfirm } = useAuthContext()
//   const postLoginRedirectUrl = usePostLoginRedirectUrl()

//   const handleResetConfirm = () => {
//     toast.promise(
//       async () => {
//         await passwordResetConfirm.run({
//           email: props.email,
//           token: token(),
//           password: password(),
//         })
//         navigate(postLoginRedirectUrl())
//       },
//       {
//         error: (err) => `Failed to reset password: ${err.message}`,
//         success: "Password reset successful!",
//         loading: "Resetting password...",
//       }
//     )
//   }

//   return (
//     <div class="flex w-full max-w-xs flex-col gap-y-3">
//       <p class="text-gray-600 text-sm">Enter the code from your email and your new password.</p>
//       <TextFieldComp label="Reset Code" value={token()} onChange={setToken} placeholder="123456" />
//       <TextFieldComp
//         label="New Password"
//         value={password()}
//         onChange={setPassword}
//         type="password"
//       />
//       <Button onClick={handleResetConfirm} loading={passwordResetConfirm.loading()}>
//         Reset Password
//       </Button>
//     </div>
//   )
// }

// export default function ForgotPasswordPage() {
//   useMetadata({
//     title: getTitle("Forgot Password"),
//   })

//   const [email, setEmail] = createSignal<string | null>(null)

//   return (
//     <div class="flex h-full flex-1 flex-col">
//       <div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-y-5">
//         <h1 class="font-medium text-3xl">Forgot Password</h1>

//         <Show when={email()} fallback={<EmailForm onSent={setEmail} />}>
//           <ResetForm email={email()!} />
//         </Show>
//       </div>
//     </div>
//   )
// }

export default function Page() {
  return <></>
}
