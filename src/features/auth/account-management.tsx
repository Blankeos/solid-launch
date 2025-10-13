import { IconGitHub, IconGoogle } from '@/assets/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { honoClient } from '@/lib/hono-client'
import { cn } from '@/utils/cn'
import { useQuery } from '@tanstack/solid-query'
import { Index, Show, VoidProps } from 'solid-js'
import { useAuthContext } from './auth.context'

export function AccountManagement(props: VoidProps<{ class?: string }>) {
  const { user } = useAuthContext()

  const profileQuery = useQuery(() => ({
    queryKey: ['auth.profile'],
    queryFn: async () => {
      const resp = await honoClient.auth.profile.$get()
      if (!resp.ok) throw new Error('Failed to fetch profile')
      return resp.json()
    },
    enabled: !!user(),
  }))

  return (
    <div class={cn('mx-auto w-full max-w-2xl', props.class)}>
      <h2 class="mb-6 text-2xl font-semibold">Account</h2>

      <Card class="mb-4">
        <CardHeader>
          <CardTitle class="text-base">Profile</CardTitle>
          <CardDescription>Your basic account information</CardDescription>
        </CardHeader>
        <CardContent class="grid gap-4">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-sm">Email address</span>
            <span class="text-sm font-medium">{user()?.email}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground text-sm">Email status</span>
            <Badge variant={user()?.email_verified ? 'default' : 'warning'}>
              {user()?.email_verified ? 'Verified' : 'Unverified'}
            </Badge>
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
        <Card class="mb-4">
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
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
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
                    <li class="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div class="flex items-center gap-3">
                        <svg
                          class="text-muted-foreground h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.21-.72-4.23-1.91-5.82"
                          />
                        </svg>
                        <div>
                          <p class="text-sm font-medium">Session {s().id}</p>
                          <p class="text-muted-foreground text-xs">
                            Expires {new Date(s().expires_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Revoke
                      </Button>
                    </li>
                  )}
                </Index>
              </ul>
            </Show>
          </CardContent>
        </Card>
      </Show>

      <Show when={profileQuery.isLoading}>
        <Card class="mb-4">
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
