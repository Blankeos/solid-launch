import type { Selectable } from "kysely"
import z from "zod"
import type { Organization, OrganizationInvitation } from "@/server/db/types"
import { assertDTO } from "@/server/utils/assert-dto"
import type { UserMetaDTO } from "../auth/auth.dto"
import { jsonDecode } from "../auth/auth.utilities"

// ===========================================================================
// Shared metadata DTO (re-usable, like userMetaDTO)
// ===========================================================================
export const orgMetaDTO = z
  .object({
    billing_tier: z.enum(["free", "pro", "enterprise"]).optional(),
    features: z.array(z.string()).optional(),
  })
  .optional()
  .nullable()
export type OrgMetaDTO = z.infer<typeof orgMetaDTO>

// ===========================================================================
// Input DTOs
// ===========================================================================
export const createOrganizationDTO = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
})
export type CreateOrganizationDTO = z.infer<typeof createOrganizationDTO>

export const updateOrganizationDTO = z.object({
  name: z.string().min(1).max(255).optional(),
  metadata: orgMetaDTO,
})
export type UpdateOrganizationDTO = z.infer<typeof updateOrganizationDTO>

export const inviteMemberDTO = z.object({
  email: z.email(),
  role: z.enum(["owner", "admin", "member"]).optional().default("member"),
})
export type InviteMemberDTO = z.infer<typeof inviteMemberDTO>

export const acceptInvitationDTO = z.object({
  invitationId: z.string(),
})
export type AcceptInvitationDTO = z.infer<typeof acceptInvitationDTO>

// ===========================================================================
// Response DTOs
// ===========================================================================
export function getOrganizationMemberMetaResponseDTO(user_meta: UserMetaDTO) {
  return {
    name: user_meta?.name,
    avatar_url: user_meta?.avatar_url,
    avatar_object_id: user_meta?.avatar_object_id,
  }
}

export function getOrganizationResponseDTO(org: Selectable<Organization>) {
  const orgMeta = assertDTO(jsonDecode(org.metadata as string), orgMetaDTO) as OrgMetaDTO
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    metadata: orgMeta,
    created_at: org.created_at,
    updated_at: org.updated_at,
  }
}
export type OrganizationResponseDTO = ReturnType<typeof getOrganizationResponseDTO>

export function getOrganizationMemberResponseDTO(member: any) {
  return {
    organization_id: member.organization_id,
    user_id: member.user_id,
    role: member.role,
    created_at: member.created_at,
    member_created_at: member.member_created_at,
  }
}
export type OrganizationMemberResponseDTO = ReturnType<typeof getOrganizationMemberResponseDTO>

export function getOrganizationInvitationResponseDTO(
  invitation: Selectable<OrganizationInvitation>
) {
  return {
    id: invitation.id,
    organization_id: invitation.organization_id,
    email: invitation.email,
    role: invitation.role,
    expires_at: invitation.expires_at,
    created_at: invitation.created_at,
  }
}
export type OrganizationInvitationResponseDTO = ReturnType<
  typeof getOrganizationInvitationResponseDTO
>
