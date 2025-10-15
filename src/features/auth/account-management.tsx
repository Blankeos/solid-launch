import { IconGitHub, IconGoogle } from '@/assets/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { honoClient } from '@/lib/hono-client'
import { cn } from '@/utils/cn'
import { useMutation, useQuery } from '@tanstack/solid-query'
import { Index, Show, VoidProps } from 'solid-js'
import { toast } from 'solid-sonner'
import { useAuthContext } from './auth.context'

export function AccountManagement(props: VoidProps<{ class?: string }>) {
  const { user, revokeSession } = useAuthContext()

  const profileQuery = useQuery(() => ({
    queryKey: ['auth.profile'],
    queryFn: async () => {
      const resp = await honoClient.auth.profile.$get()
      return resp.json()
    },
    enabled: !!user(),
  }))

  const sendVerificationEmailMut = useMutation(() => ({
    mutationKey: ['auth.verify-email'],
    mutationFn: async () => {
      const resp = await honoClient.auth['verify-email'].$post({ json: { email: user()!.email } })
      return resp.json()
    },
    onError: (err) => {
      toast.error(`Could not send email: ${err.message}`)
    },
  }))

  function handleRevokeSession(revokeId: string) {
    toast.promise(revokeSession.run({ revokeId }), {
      loading: 'Revoking session…',
      success: 'Session revoked',
      error: (err) => `Could not revoke session: ${err.message}`,
    })
  }

  return (
    <div class={cn('mx-auto w-full max-w-2xl', props.class)}>
      <h2 class="mb-6 text-2xl font-semibold">Account</h2>

      <Card class="mb-4 overflow-hidden">
        <CardHeader>
          <CardTitle class="text-base">Profile</CardTitle>
          <CardDescription>Your basic account information</CardDescription>
        </CardHeader>
        <CardContent class="grid gap-4">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-sm">Email address</span>
            <span class="text-sm font-medium">{user()?.email}</span>
          </div>
          <div class="flex items-start justify-between">
            <span class="text-muted-foreground text-sm">Email status</span>

            <div class="flex items-center gap-1.5">
              <Show when={!user()?.email_verified}>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => sendVerificationEmailMut.mutate()}
                  disabled={sendVerificationEmailMut.isPending || !!sendVerificationEmailMut.data}
                >
                  📩{' '}
                  {sendVerificationEmailMut.data
                    ? 'Check your email'
                    : sendVerificationEmailMut.isPending
                      ? 'Sending...'
                      : 'Send verification email'}
                </Button>
              </Show>
              <Badge variant={user()?.email_verified ? 'success' : 'warning'}>
                {user()?.email_verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-sm">Name</span>
            <span class="text-sm font-medium">{user()?.metadata?.name || '—'}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-sm">Avatar</span>
            <span class="text-sm font-medium">
              {user()?.metadata?.avatar_url ? (
                <img
                  src={user()!.metadata!.avatar_url}
                  alt="Avatar"
                  class="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                '—'
              )}
            </span>
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
                        <div class="bg-background flex h-8 w-8 items-center justify-center rounded-md border">
                          {acc().provider === 'google' ? <IconGoogle /> : <IconGitHub />}
                        </div>
                        <div>
                          <p class="text-sm font-medium capitalize">{acc().provider}</p>
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
    </div>
  )
}

function SessionItem(props: {
  // Can be improved (get from the server via a type)
  session: {
    device_name?: string | null
    display_id?: string | null
    expires_at: string
    ip_address?: string | null
    revoke_id: string
  }
  onRevoke: (id: string) => void
  loading: boolean
}) {
  const deviceEmoji = () => {
    const name = (props.session.device_name || '').toLowerCase()
    if (name.includes('mac') || name.includes('apple') || name.includes('os x')) return '🍎'
    if (name.includes('windows')) return '🪟'
    if (name.includes('linux')) return '🐧'
    if (name.includes('mobile') || name.includes('android') || name.includes('ios')) return '📱'
    return '💻'
  }
  const expiresText = () => {
    // This won't really show, but just in case...
    const expired = new Date() > new Date(props.session.expires_at)
    if (expired)
      return {
        text: `Expired ${new Date(props.session.expires_at).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}`,
        class: 'text-destructive',
      }
    return {
      text: `Expires ${new Date(props.session.expires_at).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })}`,
      class: 'text-muted-foreground',
    }
  }

  return (
    <li class="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <div class="flex items-center gap-3">
        <span class="text-muted-foreground text-lg">{deviceEmoji()}</span>
        <div>
          <p class="text-sm font-medium">{props.session.display_id || 'Unknown Device'}</p>
          <p class="text-xs">
            {props.session.device_name} ·{' '}
            <span class={expiresText().class}>{expiresText().text}</span>
            {props.session.ip_address && <span> · {props.session.ip_address}</span>}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => props.onRevoke(props.session.revoke_id)}
        disabled={props.loading}
      >
        {props.loading ? 'Revoking…' : 'Revoke'}
      </Button>
    </li>
  )
}
