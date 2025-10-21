import { useMetadata } from "vike-metadata-solid"
import { useAuthContext } from "@/features/auth/auth.context"
import ProtectedRoute from "@/features/auth/protected-route"
import getTitle from "@/utils/get-title"

export default function SettingsPage() {
  useMetadata({
    title: getTitle("Settings"),
  })

  const { user } = useAuthContext()

  return (
    <ProtectedRoute>
      <div class="flex flex-col gap-y-4 py-8">Settings Page: {user()?.id}</div>
    </ProtectedRoute>
  )
}
