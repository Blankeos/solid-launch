import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query"
import type { InferResponseType } from "hono"
import { honoClient } from "@/lib/hono-client"
import { useAuthContext } from "../auth/auth.context"

const OrganizationsQuery = {
  "active-organization": "active-organization",
  "list-organizations": "list-organizations",
  "organization-members": "organization-members",
  "organization-invitations": "organization-invitations",
  "pending-invitation": "pending-invitation",
}

export type InvitationListItem = InferResponseType<
  (typeof honoClient.auth.organizations)[":orgId"]["invitations"]["$get"]
>["invitations"][number]

export type MembersListItem = InferResponseType<
  (typeof honoClient.auth.organizations)[":orgId"]["members"]["$get"]
>["members"][number]

/**
 * Decided to use TanStack Query because at this point, if you need organization-features,
 * you might probably need TanStack anyway.
 */
export function useOrganizations(params?: {
  queriesOnMount: (keyof typeof OrganizationsQuery)[]
  pendingInvitationId?: string
}) {
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

  const organizationInvitationsQuery = useQuery(() => ({
    queryKey: [OrganizationsQuery["organization-invitations"], user()?.active_organization_id],
    queryFn: async () => {
      const orgId = user()?.active_organization_id
      if (!orgId) return []

      const response = await honoClient.auth.organizations[":orgId"].invitations.$get({
        param: { orgId: orgId },
      })
      const data = await response.json()
      return data.invitations ?? []
    },
  }))

  const pendingInvitationQuery = useQuery(() => ({
    queryKey: [OrganizationsQuery["pending-invitation"], params?.pendingInvitationId],
    queryFn: async ({ queryKey: [, invitationId] }) => {
      if (!invitationId) return
      const response = await honoClient.auth.organizations.invite[":invitationId"].$get({
        param: { invitationId: invitationId },
      })
      const data = await response.json()
      return data.invitation
    },
    enabled: !!params?.pendingInvitationId,
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
      await listOrganizationsQuery.refetch()
      await activeOrganizationQuery.refetch()

      return response.json()
    },
  }))

  const deleteOrganizationMutation = useMutation(() => ({
    mutationFn: async ({ orgId }: { orgId: string }) => {
      const response = await honoClient.auth.organizations[":orgId"].$delete({
        param: { orgId },
      })

      await refresh.run()
      await listOrganizationsQuery.refetch()
      await activeOrganizationQuery.refetch()

      return response.json()
    },
  }))

  const inviteMemberMutation = useMutation(() => ({
    mutationFn: async ({
      orgId,
      email,
      role,
    }: {
      orgId: string
      email: string
      role?: "member" | "admin"
    }) => {
      const response = await honoClient.auth.organizations[":orgId"].invite.$post({
        param: { orgId },
        json: { email, role },
      })
      await organizationInvitationsQuery.refetch()
      return response.json()
    },
  }))

  const acceptInvitationMutation = useMutation(() => ({
    mutationFn: async ({ invitationId }: { invitationId: string }) => {
      const response = await honoClient.auth.organizations.invite[":invitationId"].accept.$post({
        param: { invitationId },
      })
      await refresh.run()
      await activeOrganizationQuery.refetch()
      await organizationMembersQuery.refetch()
      await organizationInvitationsQuery.refetch()
      return response.json()
    },
  }))

  const revokeInvitationMutation = useMutation(() => ({
    mutationFn: async ({ orgId, invitationId }: { orgId: string; invitationId: string }) => {
      const response = await honoClient.auth.organizations[":orgId"].invitations[
        ":invitationId"
      ].$delete({
        param: { orgId, invitationId },
      })
      await organizationInvitationsQuery.refetch()
      return response.json()
    },
  }))

  const leaveOrganizationMutation = useMutation(() => ({
    mutationFn: async ({ orgId }: { orgId: string }) => {
      const response = await honoClient.auth.organizations[":orgId"].leave.$post({
        param: { orgId },
      })
      await refresh.run()
      await listOrganizationsQuery.refetch()
      await activeOrganizationQuery.refetch()
      return response.json()
    },
  }))

  const removeMemberMutation = useMutation(() => ({
    mutationFn: async ({ orgId, userId }: { orgId: string; userId: string }) => {
      const response = await honoClient.auth.organizations[":orgId"].members[":userId"].$delete({
        param: { orgId, userId },
      })
      await organizationMembersQuery.refetch()
      return response.json()
    },
  }))

  const updateMemberRoleMutation = useMutation(() => ({
    mutationFn: async ({
      orgId,
      userId,
      role,
    }: {
      orgId: string
      userId: string
      role: "member" | "admin" | "owner"
    }) => {
      const response = await honoClient.auth.organizations[":orgId"].members[":userId"].role.$patch(
        {
          param: { orgId, userId },
          json: { role },
        }
      )
      await organizationMembersQuery.refetch()
      return response.json()
    },
  }))

  return {
    listOrganizationsQuery,
    activeOrganizationQuery,
    organizationMembersQuery,
    setActiveOrganizationMutation,
    createOrganizationMutation,
    deleteOrganizationMutation,

    organizationInvitationsQuery,
    pendingInvitationQuery,
    inviteMemberMutation,
    acceptInvitationMutation,
    revokeInvitationMutation,

    leaveOrganizationMutation,
    removeMemberMutation,
    updateMemberRoleMutation,
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
