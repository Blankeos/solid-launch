import { useMetadata } from "vike-metadata-solid"
import { IconCheck } from "@/assets/icons"
import { AvatarComp } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ProtectedRoute from "@/features/auth/protected-route"
import getTitle from "@/utils/get-title"

export default function DashboardPage() {
  useMetadata({
    title: getTitle("Dashboard"),
  })

  return (
    <>
      <ProtectedRoute>
        <div class="mx-auto flex w-full max-w-2xl flex-col gap-y-4 px-4 py-8">
          <h1 class="font-semibold text-3xl">Dashboard</h1>

          <section class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>Total Revenue</CardDescription>
                <CardTitle class="text-2xl">$45,231.89</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-muted-foreground text-sm">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Subscriptions</CardDescription>
                <CardTitle class="text-2xl">+2,350</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-muted-foreground text-sm">+180.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Sales</CardDescription>
                <CardTitle class="text-2xl">+12,234</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-muted-foreground text-sm">+19% from last month</p>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest transactions and updates</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <AvatarComp fallback="JD" />
                    <div>
                      <p class="font-medium">John Doe</p>
                      <p class="text-muted-foreground text-sm">Subscription renewed</p>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <AvatarComp fallback="AS" />
                    <div>
                      <p class="font-medium">Alice Smith</p>
                      <p class="text-muted-foreground text-sm">New user registration</p>
                    </div>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <AvatarComp fallback="RJ" />
                    <div>
                      <p class="font-medium">Robert Johnson</p>
                      <p class="text-muted-foreground text-sm">Payment received</p>
                    </div>
                  </div>
                  <Badge variant="info">Completed</Badge>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Complete these steps to set up your workspace</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <IconCheck />
                    </div>
                    <div>
                      <p class="font-medium">Create your first workspace</p>
                      <p class="text-muted-foreground text-sm">Start organizing your projects</p>
                    </div>
                  </div>
                  <Badge variant="success" class="flex gap-1">
                    <IconCheck />
                    Done
                  </Badge>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <IconCheck />
                    </div>
                    <div>
                      <p class="font-medium">Invite team members</p>
                      <p class="text-muted-foreground text-sm">Collaborate with your colleagues</p>
                    </div>
                  </div>
                  <Badge variant="success" class="flex gap-1">
                    <IconCheck />
                    Done
                  </Badge>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <IconCheck />
                    </div>
                    <div>
                      <p class="font-medium">Connect your integrations</p>
                      <p class="text-muted-foreground text-sm">
                        Sync data from your favorite tools
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" class="flex gap-1">
                    <IconCheck />
                    Done
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </ProtectedRoute>
    </>
  )
}
