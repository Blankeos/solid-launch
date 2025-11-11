import { navigate } from "vike/client/router"
import ProtectedRoute from "@/features/auth/protected-route"
import { AcceptInvitation } from "@/features/organizations/accept-invitation"
import { getRoute, useParams } from "@/route-tree.gen"

export default function Page() {
  const routeParams = useParams({ from: "/accept-invitation/@invitationId" })

  return (
    <ProtectedRoute>
      <div class="mx-auto flex max-w-5xl flex-1 flex-col items-center justify-center px-7">
        <AcceptInvitation
          invitationId={routeParams().invitationId}
          onSuccess={() => {
            navigate(getRoute("/dashboard"))
          }}
        />
      </div>
    </ProtectedRoute>
  )
}
