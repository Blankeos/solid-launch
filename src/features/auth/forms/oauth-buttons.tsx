import { toast } from "solid-sonner"
import { navigate } from "vike/client/router"
import { IconGitHub, IconGoogle } from "@/assets/icons"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "../auth.context"
import { usePostLoginRedirectUrl } from "../use-post-login-redirect-url"

export function OAuthButtons() {
  const { googleLogin, githubLogin } = useAuthContext()

  const postLoginRedirectUrl = usePostLoginRedirectUrl()

  const handleGithubLogin = () => {
    toast.promise(
      async () => {
        const result = await githubLogin.run({})
        if (result?.success) navigate(postLoginRedirectUrl())
      },
      {
        error: "Failed to login with GitHub",
        success: "Logged in with GitHub",
        loading: "Logging in with GitHub...",
      }
    )
  }

  const handleGoogleLogin = () => {
    toast.promise(
      async () => {
        const result = await googleLogin.run({})
        if (result?.success) navigate(postLoginRedirectUrl())
      },
      {
        error: "Failed to login with Google",
        success: "Logged in with Google",
        loading: "Logging in with Google...",
      }
    )
  }
  return (
    <div class="flex gap-x-3">
      <Button
        onClick={handleGithubLogin}
        loading={githubLogin.loading()}
        variant="outline"
        class="bg-white"
      >
        <IconGitHub />
      </Button>

      <Button onClick={handleGoogleLogin} loading={googleLogin.loading()} variant="outline">
        <IconGoogle />
      </Button>
    </div>
  )
}
