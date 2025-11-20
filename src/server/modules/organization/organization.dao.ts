import type { Insertable } from "kysely"
import { db } from "@/server/db/kysely"
import type { OrganizationInvitation, OrganizationMember } from "@/server/db/types"
import { ApiError } from "@/server/lib/error"
import { generateId, jsonDecode } from "@/server/modules/auth/auth.utilities"
import { assertDTO } from "@/server/utils/assert-dto"
import { getUserResponseMetaDTO, type UserMetaDTO } from "../auth/auth.dto"
import { type OrgMetaDTO, orgMetaDTO } from "./organization.dto"

type CreateMemberData = Insertable<OrganizationMember>
type CreateInvitationData = Insertable<OrganizationInvitation>

export class OrganizationDAO {
  // 👉 Organization CRUD
  async listUserOrganizations(userId: string) {
    const rows = await db
      .selectFrom("organization_member")
      .innerJoin("organization", "organization_member.organization_id", "organization.id")
      .select([
        "organization.id",
        "organization.name",
        "organization.slug",
        "organization.metadata",
        "organization.created_at",
        "organization.updated_at",
        "organization_member.role",
        "organization_member.created_at as member_created_at",
      ])
      .where("organization_member.user_id", "=", userId)
      .execute()

    return rows.map((row) => ({
      ...row,
      metadata: row.metadata
        ? assertDTO(jsonDecode(row.metadata as string), orgMetaDTO)
        : undefined,
    }))
  }

  async getOrganizationById(id: string) {
    return await db.selectFrom("organization").selectAll().where("id", "=", id).executeTakeFirst()
  }

  async getOrganizationBySlug(slug: string) {
    return await db
      .selectFrom("organization")
      .selectAll()
      .where("slug", "=", slug)
      .executeTakeFirst()
  }

  async createOrganization(data: { name: string; slug?: string; metadata?: OrgMetaDTO }) {
    const organization = await db
      .insertInto("organization")
      .values({
        id: generateId(),
        name: data.name,
        slug: data.slug,
        metadata: JSON.stringify(data.metadata || {}),
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return organization
  }

  async updateOrganization(
    organizationId: string,
    data: { name?: string; slug?: string; metadata?: OrgMetaDTO }
  ) {
    const updates: Record<string, unknown> = {}
    if (data.name !== undefined) updates.name = data.name
    if (data.slug !== undefined) updates.slug = data.slug
    if (data.metadata !== undefined) updates.metadata = JSON.stringify(data.metadata)
    updates.updated_at = new Date().toISOString()

    return await db
      .updateTable("organization")
      .set(updates)
      .where("id", "=", organizationId)
      .returningAll()
      .executeTakeFirstOrThrow()
  }

  async deleteOrganization(organizationId: string) {
    return await db.transaction().execute(async (trx) => {
      // Delete all invitations
      await trx
        .deleteFrom("organization_invitation")
        .where("organization_id", "=", organizationId)
        .execute()

      // Delete all members
      await trx
        .deleteFrom("organization_member")
        .where("organization_id", "=", organizationId)
        .execute()

      // Delete organization
      const organization = await trx
        .deleteFrom("organization")
        .where("id", "=", organizationId)
        .returningAll()
        .executeTakeFirst()

      if (!organization) {
        throw ApiError.NotFound("Organization not found")
      }

      return organization
    })
  }

  // 👉 Member CRUD

  async getOrganizationMembers(organizationId: string) {
    const members = await db
      .selectFrom("organization_member")
      .innerJoin("user", "organization_member.user_id", "user.id")
      .select([
        "organization_member.organization_id",
        "organization_member.user_id",
        "organization_member.role",
        "organization_member.created_at",
        "organization_member.updated_at",
        "user.email",
        "user.email_verified",
        "user.joined_at",
        "user.metadata",
      ])
      .where("organization_member.organization_id", "=", organizationId)
      .execute()

    return await Promise.all(
      members.map(async (member) => ({
        ...member,
        metadata: await getUserResponseMetaDTO(
          jsonDecode(member.metadata as string) as UserMetaDTO
        ),
      }))
    )
  }

  async getOrganizationOwners(organizationId: string) {
    return await db
      .selectFrom("organization_member")
      .innerJoin("user", "organization_member.user_id", "user.id")
      .select([
        "organization_member.organization_id",
        "organization_member.user_id",
        "organization_member.role",
        "organization_member.created_at",
        "organization_member.updated_at",
        "user.email",
        "user.email_verified",
        "user.joined_at",
      ])
      .where("organization_member.organization_id", "=", organizationId)
      .where("organization_member.role", "=", "owner")
      .execute()
  }

  async addOrganizationMember(data: CreateMemberData) {
    const member = await db
      .insertInto("organization_member")
      .values({
        organization_id: data.organization_id,
        user_id: data.user_id,
        role: data.role || "member",
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return member
  }

  async getMembership(params: { organizationId: string; userId: string }) {
    return await db
      .selectFrom("organization_member")
      .select(["organization_id", "user_id", "role", "created_at"])
      .where("organization_id", "=", params.organizationId)
      .where("user_id", "=", params.userId)
      .executeTakeFirst()
  }

  async updateMembership(organizationId: string, userId: string, role: string) {
    return await db
      .updateTable("organization_member")
      .set({ role, updated_at: new Date().toISOString() })
      .where("organization_id", "=", organizationId)
      .where("user_id", "=", userId)
      .returningAll()
      .executeTakeFirst()
  }

  async removeMember(organizationId: string, userId: string) {
    return await db
      .deleteFrom("organization_member")
      .where("organization_id", "=", organizationId)
      .where("user_id", "=", userId)
      .returningAll()
      .executeTakeFirst()
  }

  async leaveOrganization(organizationId: string, userId: string) {
    // Check if user is the last owner
    const owners = await db
      .selectFrom("organization_member")
      .select("user_id")
      .where("organization_id", "=", organizationId)
      .where("role", "=", "owner")
      .execute()

    if (owners.length === 1 && owners[0].user_id === userId) {
      throw ApiError.BadRequest("Cannot leave organization as the last owner")
    }

    return await this.removeMember(organizationId, userId)
  }

  // 👉 Invitation CRUD

  async listPendingInvitations(organizationId: string) {
    const results = await db
      .selectFrom("organization_invitation")
      .innerJoin("user", "organization_invitation.invited_by_id", "user.id")
      .select([
        "organization_invitation.id",
        "organization_invitation.organization_id",
        "organization_invitation.email",
        "organization_invitation.role",
        "organization_invitation.invited_by_id",
        "organization_invitation.created_at",
        "organization_invitation.expires_at",
        "organization_invitation.accepted_at",
        "organization_invitation.rejected_at",
        "user.email as invited_by_email",
        "user.metadata as invited_by_metadata",
      ])
      .where("organization_invitation.organization_id", "=", organizationId)
      .where("organization_invitation.accepted_at", "is", null)
      .where("organization_invitation.rejected_at", "is", null)
      .orderBy("organization_invitation.created_at", "desc")
      .execute()

    return await Promise.all(
      results.map(async (result) => ({
        ...result,
        invited_by_metadata: await getUserResponseMetaDTO(
          jsonDecode(result.invited_by_metadata as string) as UserMetaDTO
        ),
      }))
    )
  }

  async getPendingInvitation(params: { id: string; email: string }) {
    const result = await db
      .selectFrom("organization_invitation")
      .innerJoin("user", "organization_invitation.invited_by_id", "user.id")
      .innerJoin("organization", "organization_invitation.organization_id", "organization.id")
      .selectAll("organization_invitation")
      .select((eb) => [
        "invited_by_id",
        "user.metadata as invited_by_metadata",
        "organization.name as organization_name",
        eb
          .selectFrom("organization_member")
          .select(db.fn.count("organization_member.user_id").as("member_count"))
          .whereRef(
            "organization_member.organization_id",
            "=",
            "organization_invitation.organization_id"
          )
          .as("member_count"),
      ])
      .where("organization_invitation.id", "=", params.id)
      .where("organization_invitation.email", "=", params.email)
      .where("organization_invitation.accepted_at", "is", null)
      .where("organization_invitation.rejected_at", "is", null)
      .where("organization_invitation.expires_at", ">", new Date().toISOString())
      .executeTakeFirst()

    if (!result) return undefined

    return {
      ...result,
      invited_by_metadata: await getUserResponseMetaDTO(
        jsonDecode(result.invited_by_metadata as string) as UserMetaDTO
      ),
    }
  }

  async getInvitationByEmailAndOrg(organizationId: string, email: string) {
    return await db
      .selectFrom("organization_invitation")
      .selectAll()
      .where("organization_id", "=", organizationId)
      .where("email", "=", email)
      .executeTakeFirst()
  }

  async createInvitation(data: CreateInvitationData) {
    const invitation = await db
      .insertInto("organization_invitation")
      .values({
        id: generateId(),
        organization_id: data.organization_id,
        email: data.email,
        role: data.role || "member",
        invited_by_id: data.invited_by_id,
        expires_at: data.expires_at,
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return invitation
  }

  async acceptInvitation(id: string, userId: string) {
    return await db.transaction().execute(async (trx) => {
      // Get invitation and validate
      const invitation = await trx
        .selectFrom("organization_invitation")
        .selectAll()
        .where("id", "=", id)
        .where("accepted_at", "is", null)
        .where("rejected_at", "is", null)
        .where("expires_at", ">", new Date().toISOString())
        .executeTakeFirst()

      if (!invitation) {
        throw ApiError.NotFound("Invitation not found or expired")
      }

      // Add user to organization
      const member = await trx
        .insertInto("organization_member")
        .values({
          organization_id: invitation.organization_id,
          user_id: userId,
          role: invitation.role,
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      // Mark invitation as accepted
      await trx
        .updateTable("organization_invitation")
        .set({ accepted_at: new Date().toISOString() })
        .where("id", "=", id)
        .execute()

      return member
    })
  }

  async revokeInvitation(id: string, userId: string) {
    return await db.transaction().execute(async (trx) => {
      const invitation = await trx
        .selectFrom("organization_invitation")
        .innerJoin(
          "organization_member",
          "organization_invitation.organization_id",
          "organization_member.organization_id"
        )
        .select([
          "organization_invitation.id",
          "organization_invitation.organization_id",
          "organization_invitation.accepted_at",
          "organization_invitation.rejected_at",
        ])
        .where("organization_invitation.id", "=", id)
        .where("organization_member.user_id", "=", userId)
        .where("organization_member.role", "=", "owner")
        .executeTakeFirst()

      if (!invitation || invitation.accepted_at || invitation.rejected_at) {
        throw ApiError.NotFound("Invitation not found or already resolved")
      }

      return await trx
        .deleteFrom("organization_invitation")
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow()
    })
  }
}
