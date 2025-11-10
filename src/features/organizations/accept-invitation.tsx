import type { Component } from "solid-js"
import { createSignal, Show, Suspense } from "solid-js"
import { toast } from "solid-sonner"
import { IconCheck, IconLoading, IconX } from "@/assets/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useOrganizations } from "./use-organizations"

interface AcceptInvitationProps {
  invitationId: string
  onSuccess?: () => void
}

export const AcceptInvitation: Component<AcceptInvitationProps> = (props) => {
  const [accepted, setAccepted] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)

  const { pendingInvitationQuery, acceptInvitationMutation } = useOrganizations({
    queriesOnMount: ["pending-invitation"],
    pendingInvitationId: props.invitationId,
  })

  const handleAccept = async () => {
    try {
      setError(null)
      await acceptInvitationMutation.mutateAsync(
        { invitationId: props.invitationId },
        {
          onSuccess: props.onSuccess,
          onError: (error) => {
            toast.error(error.message)
          },
        }
      )
      setAccepted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation")
    }
  }

  return (
    <Card class="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Join Organization</CardTitle>
        <CardDescription>
          Accept this invitation to become a member of the organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={
            <div class="flex items-center gap-2 text-muted-foreground">
              <IconLoading class="animate-spin" />
              <span>Loading invitation...</span>
            </div>
          }
        >
          <Show when={accepted()}>
            <div class="flex items-center gap-2 text-green-600">
              <IconCheck />
              <span class="font-medium">Invitation accepted! Redirecting...</span>
            </div>
          </Show>

          <Show when={!accepted()}>
            <Show when={pendingInvitationQuery.data}>
              <div class="space-y-4">
                <div>
                  <p class="font-medium text-sm">Organization</p>
                  <p class="font-semibold text-lg">
                    {pendingInvitationQuery.data?.organization_name}
                  </p>
                  <p class="text-muted-foreground text-sm">
                    {pendingInvitationQuery.data?.member_count} members
                  </p>
                </div>

                <Show when={error()}>
                  <div class="flex items-center gap-2 text-destructive text-sm">
                    <IconX class="h-4 w-4" />
                    <span>{error()}</span>
                  </div>
                </Show>

                <Button
                  class="w-full"
                  onClick={handleAccept}
                  loading={acceptInvitationMutation.isPending}
                >
                  <Show when={acceptInvitationMutation.isPending} fallback="Accept Invitation">
                    Accepting...
                  </Show>
                </Button>
              </div>
            </Show>

            <Show when={pendingInvitationQuery.isError}>
              <div class="flex items-center gap-2 text-destructive">
                <IconX />
                <span>Invalid or expired invitation</span>
              </div>
            </Show>
          </Show>
        </Suspense>
      </CardContent>
    </Card>
  )
}
