import { useMetadata } from "vike-metadata-solid"
import { AccountManagement } from "@/features/auth/account-management"
import ProtectedRoute from "@/features/auth/protected-route"
import { OrganizationsManagement } from "@/features/organizations/organizations-management"
import getTitle from "@/utils/get-title"

export default function SettingsPage() {
  useMetadata({
    title: getTitle("Settings"),
  })

  return (
    <ProtectedRoute>
      <div class="mx-auto flex w-full max-w-2xl flex-col gap-y-4 px-4 py-8">
        <h2 class="mb-6 font-semibold text-2xl">Account Settings</h2>
        <AccountManagement />
        <OrganizationsManagement />
      </div>
    </ProtectedRoute>
  )
}
