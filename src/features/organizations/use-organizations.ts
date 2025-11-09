import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query"
import { honoClient } from "@/lib/hono-client"
import { useAuthContext } from "../auth/auth.context"

const OrganizationsQuery = {
  "active-organization": "active-organization",
  "list-organizations": "list-organizations",
  "organization-members": "organization-members",
}

/**
 * Decided to use TanStack Query because at this point, if you need organization-features,
 * you might probably need TanStack anyway.
 */
export function useOrganizations(params?: { queriesOnMount: (keyof typeof OrganizationsQuery)[] }) {
  const { user } = useAuthContext()
  const queriesOnMount = params?.queriesOnMount ?? ["list-organizations"]

  const { refresh } = useAuthContext()

  const queryClient = useQueryClient()

  const listOrganizationsQuery = useQuery(() => ({
    queryKey: [OrganizationsQuery["list-organizations"]],
    queryFn: async () => {
      const response = await honoClient.auth.organizations.$get()
      const data = await response.json()
      return data.organizations
    },
    enabled: queriesOnMount.includes("list-organizations") ?? false,
  }))

  const activeOrganizationQuery = useQuery(() => ({
    queryKey: [OrganizationsQuery["active-organization"]],
    queryFn: async () => {
      const response = await honoClient.auth.organizations.active.$get()
      return response.json()
    },
    enabled: queriesOnMount.includes("active-organization") ?? true,
  }))

  const organizationMembersQuery = useQuery(() => ({
    queryKey: [OrganizationsQuery["organization-members"], user()?.active_organization_id],
    queryFn: async () => {
      const orgId = user()?.active_organization_id
      if (!orgId) return []

      const response = await honoClient.auth.organizations[":orgId"].members.$get({
        param: { orgId: orgId },
      })
      const data = await response.json()
      return data.members
    },
    enabled: queriesOnMount.includes("organization-members") ?? true,
  }))

  const setActiveOrganizationMutation = useMutation(() => ({
    mutationFn: async ({ organizationId }: { organizationId: string | null }) => {
      const response = await honoClient.auth.organizations.active.$put({
        json: { orgId: organizationId },
      })
      const result = await response.json()

      await refresh.run()
      await queryClient.invalidateQueries({ queryKey: [OrganizationsQuery["active-organization"]] })

      return result
    },
  }))

  const createOrganizationMutation = useMutation(() => ({
    mutationFn: async (data: { name: string; slug?: string; description?: string }) => {
      const response = await honoClient.auth.organizations.$post({
        json: data,
      })

      await refresh.run()
      await activeOrganizationQuery.refetch()

      return response.json()
    },
  }))

  return {
    listOrganizationsQuery,
    activeOrganizationQuery,
    organizationMembersQuery,
    setActiveOrganizationMutation,
    createOrganizationMutation,
  }
}

/// WHAT I Need

// ORG CRUD
//
// Queries
// get my organizations (include null, in selector so it selects personal account)
// get active organization
// get organization members (table: user, invited, role, actions - remove member)
//
// Mutations
// 1. Create Organization logo, name, slug, creator?
// 2. Leave Organization
// 3. Update Organization Profile
// 4. Delete Organization Profile
// 5. Invite Member
// 6. Update Role (owner, admin, member)
// 7. Remove Member
