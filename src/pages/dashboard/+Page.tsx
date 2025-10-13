import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccountManagement } from '@/features/auth/account-management'
import { useAuthContext } from '@/features/auth/auth.context'
import ProtectedRoute from '@/features/auth/protected-route'
import { useClientSize } from '@/hooks/use-client-size'
import { useWindowSize } from '@/hooks/use-window-size'
import getTitle from '@/utils/get-title'
import { useMetadata } from 'vike-metadata-solid'

export default function DashboardPage() {
  useMetadata({
    title: getTitle('Dashboard'),
  })

  const { user } = useAuthContext()

  const { height, width } = useWindowSize()

  const { height: textAreaHeight, width: textAreaWidth, clientRef: textAreaRef } = useClientSize()

  return (
    <>
      <ProtectedRoute>
        <div class="mx-auto flex w-full max-w-2xl flex-col gap-y-4 px-4 py-8">
          <AccountManagement />

          <hr />

          <Card>
            <CardHeader>
              <CardTitle class="text-base">Stuff</CardTitle>
              <CardDescription>Cool stuff this template can do</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                Window Size: {width()} x {height()}
              </div>
              <div>Client Size of this textarea:</div>
              <textarea
                ref={textAreaRef}
                class="resize rounded-md border p-2"
                value={`${textAreaWidth()} x ${textAreaHeight()}`}
              />
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    </>
  )
}
