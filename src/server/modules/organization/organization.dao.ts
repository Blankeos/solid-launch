import type { Insertable } from "kysely"
import { db } from "@/server/db/kysely"
import type { OrganizationInvitation, OrganizationMember } from "@/server/db/types"
import { ApiError } from "@/server/lib/error"
import { generateId } from "@/server/modules/auth/auth.utilities"
import { assertDTO } from "@/server/utils/assert-dto"
import { getUserResponseMetaDTO, type UserMetaDTO } from "../auth/auth.dto"
import { type OrgMetaDTO, orgMetaDTO } from "./organization.dto"

type CreateMemberData = Insertable<OrganizationMember>
type CreateInvitationData = Insertable<OrganizationInvitation>

export class OrganizationDAO {
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
          JSON.parse(member.metadata as string) as UserMetaDTO
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
        ? assertDTO(JSON.parse(row.metadata as string), orgMetaDTO)
        : undefined,
    }))
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

  async createInvitation(data: CreateInvitationData) {
    const invitation = await db
      .insertInto("organization_invitation")
      .values({
        id: generateId(),
        organization_id: data.organization_id,
        email: data.email,
        role: data.role || "member",
        invited_by: data.invited_by,
        expires_at: data.expires_at,
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return invitation
  }

  async getInvitationById(id: string) {
    return await db
      .selectFrom("organization_invitation")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst()
  }

  async getInvitationByEmailAndOrg(organizationId: string, email: string) {
    return await db
      .selectFrom("organization_invitation")
      .selectAll()
      .where("organization_id", "=", organizationId)
      .where("email", "=", email)
      .executeTakeFirst()
  }

  async getPendingInvitation(organizationId: string, email: string) {
    return await db
      .selectFrom("organization_invitation")
      .innerJoin("organization", "organization_invitation.organization_id", "organization.id")
      .innerJoin("user", "organization_invitation.invited_by", "user.id")
      .selectAll("organization_invitation")
      .select(["organization.name as organization_name", "user.email as invited_by_email"])
      .where("organization_invitation.organization_id", "=", organizationId)
      .where("organization_invitation.email", "=", email)
      .where("organization_invitation.accepted_at", "is", null)
      .where("organization_invitation.rejected_at", "is", null)
      .where("organization_invitation.expires_at", ">", new Date().toISOString())
      .executeTakeFirst()
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
}
//
