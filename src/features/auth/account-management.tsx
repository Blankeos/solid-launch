import { useMutation, useQuery } from "@tanstack/solid-query"
import { useDisclosure } from "bagon-hooks"
import type { InferResponseType } from "hono"
import { Index, Show, type VoidProps } from "solid-js"
import { toast } from "solid-sonner"
import { IconGitHub, IconGoogle } from "@/assets/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { honoClient } from "@/lib/hono-client"
import { cn } from "@/utils/cn"
import { useAuthContext } from "./auth.context"
import { AvatarEditorDialog } from "./avatar-editor-dialog"

type ProfileQueryResponse = InferResponseType<typeof honoClient.auth.profile.$get>

export function AccountManagement(props: VoidProps<{ class?: string }>) {
  const { user, revokeSession } = useAuthContext()

  const [avatarEditOpen, avatarEditActions] = useDisclosure()

  const profileQuery = useQuery(() => ({
    queryKey: ["auth.profile"],
    queryFn: async () => {
      const resp = await honoClient.auth.profile.$get()
      return resp.json()
    },
    enabled: !!user(),
  }))

  const sendVerificationEmailMutation = useMutation(() => ({
    mutationKey: ["auth.verify-email"],
    mutationFn: async () => {
      const resp = await honoClient.auth["verify-email"].$post({ json: { email: user()!.email } })
      return resp.json()
    },
    onError: (err) => {
      toast.error(`Could not send email: ${err.message}`)
    },
  }))

  function handleRevokeSession(revokeId: string) {
    toast.promise(revokeSession.run({ revokeId }), {
      loading: "Revoking session…",
      success: "Session revoked",
      error: (err) => `Could not revoke session: ${err.message}`,
    })
  }

  return (
    <section class={cn("mx-auto w-full max-w-2xl", props.class)}>
      <Card class="mb-4 overflow-hidden">
        <CardHeader>
          <CardTitle class="text-base">Profile</CardTitle>
          <CardDescription>Your basic account information</CardDescription>
        </CardHeader>
        <CardContent class="grid gap-4">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-sm">Email address</span>
            <span class="font-medium text-sm">{user()?.email}</span>
          </div>
          <div class="flex items-start justify-between">
            <span class="text-muted-foreground text-sm">Email status</span>

            <div class="flex items-center gap-1.5">
              <Show when={!user()?.email_verified}>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => sendVerificationEmailMutation.mutate()}
                  disabled={
                    sendVerificationEmailMutation.isPending || !!sendVerificationEmailMutation.data
                  }
                >
                  📩{" "}
                  {sendVerificationEmailMutation.data
                    ? "Check your email"
                    : sendVerificationEmailMutation.isPending
                      ? "Sending..."
                      : "Send verification email"}
                </Button>
              </Show>
              <Badge variant={user()?.email_verified ? "success" : "warning"}>
                {user()?.email_verified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-sm">Name</span>
            <span class="font-medium text-sm">{user()?.metadata?.name || "—"}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-sm">Avatar</span>
            <button class="font-medium text-sm" onClick={avatarEditActions.open} type="button">
              <Avatar>
                <AvatarImage src={user()?.metadata?.avatar_url} alt="Avatar" />
                <AvatarFallback class="bg-sidebar text-xs">
                  {user()?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </CardContent>
        <div class="flex justify-end p-4 pt-0">
          <Button variant="outline" size="sm">
            Update Profile
          </Button>
        </div>
      </Card>

      <Show when={profileQuery.data}>
        <Card class="mb-4 overflow-hidden">
          <CardHeader>
            <CardTitle class="text-base">Connected accounts</CardTitle>
            <CardDescription>Manage your social logins</CardDescription>
          </CardHeader>
          <CardContent>
            <Show
              when={profileQuery.data!.user.oauth_accounts.length}
              fallback={<p class="text-muted-foreground text-sm">No connected accounts</p>}
            >
              <ul class="divide-y">
                <Index each={profileQuery.data!.user.oauth_accounts}>
                  {(acc) => (
                    <li class="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div class="flex items-center gap-3">
                        <div class="flex h-8 w-8 items-center justify-center rounded-md border bg-background">
                          {acc().provider === "google" ? <IconGoogle /> : <IconGitHub />}
                        </div>
                        <div>
                          <p class="font-medium text-sm capitalize">{acc().provider}</p>
                          <p class="text-muted-foreground text-xs">
                            ID: {acc().provider_user_id.slice(0, 8)}…
                          </p>
                        </div>
                      </div>
                      {/*<Button variant="ghost" size="sm">
                        Remove
                      </Button>*/}
                    </li>
                  )}
                </Index>
              </ul>
            </Show>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-base">Active sessions</CardTitle>
            <CardDescription>Devices currently logged in</CardDescription>
          </CardHeader>
          <CardContent>
            <Show
              when={profileQuery.data!.user.active_sessions.length}
              fallback={<p class="text-muted-foreground text-sm">No active sessions</p>}
            >
              <ul class="divide-y">
                <Index each={profileQuery.data!.user.active_sessions}>
                  {(s) => (
                    <SessionItem
                      session={s()}
                      onRevoke={handleRevokeSession}
                      loading={revokeSession.loading()}
                    />
                  )}
                </Index>
              </ul>
            </Show>
          </CardContent>
        </Card>
      </Show>

      <Show when={profileQuery.isLoading}>
        <Card class="mb-4 overflow-hidden">
          <CardHeader>
            <Skeleton class="h-4 w-24" />
            <Skeleton class="h-3 w-40" />
          </CardHeader>
          <CardContent class="space-y-3">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-full" />
          </CardContent>
        </Card>
      </Show>

      <AvatarEditorDialog
        open={avatarEditOpen()}
        onOpenChange={avatarEditActions.set}
        onSave={() => {}}
      />
    </section>
  )
}

function SessionItem(props: {
  // Can be improved (get from the server via a type)
  session: ProfileQueryResponse["user"]["active_sessions"][number]
  onRevoke: (id: string) => void
  loading: boolean
}) {
  const deviceEmoji = () => {
    const name = (props.session.device_name || "").toLowerCase()
    if (name.includes("mac") || name.includes("apple") || name.includes("os x")) return "🍎"
    if (name.includes("windows")) return "🪟"
    if (name.includes("linux")) return "🐧"
    if (name.includes("mobile") || name.includes("android") || name.includes("ios")) return "📱"
    return "💻"
  }
  const expiresText = () => {
    // This won't really show, but just in case...
    const expired = new Date() > new Date(props.session.expires_at)
    if (expired)
      return {
        text: `Expired ${new Date(props.session.expires_at).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}`,
        class: "text-destructive",
      }
    return {
      text: `Expires ${new Date(props.session.expires_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })}`,
      class: "text-muted-foreground",
    }
  }

  return (
    <li class="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <div class="flex items-center gap-3">
        <span class="text-lg text-muted-foreground">{deviceEmoji()}</span>
        <div>
          <p class="font-medium text-sm">
            {props.session.display_id || "Unknown Device"}
            {props.session.is_current && (
              <Badge variant="secondary" class="ml-2">
                Current
              </Badge>
            )}
          </p>
          <p class="text-xs">
            {props.session.device_name} ·{" "}
            <span class={expiresText().class}>{expiresText().text}</span>
            {props.session.ip_address && <span> · {props.session.ip_address}</span>}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => props.onRevoke(props.session.revoke_id)}
        disabled={props.loading || props.session.is_current}
      >
        {props.loading ? "Revoking…" : "Revoke"}
      </Button>
    </li>
  )
}
