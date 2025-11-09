import { sendEmail } from "@/server/lib/emails"
import { renderOrgInvitationEmail } from "@/server/lib/emails/org-invitation.email"
import { ApiError } from "@/server/lib/error"
import { AuthDAO } from "@/server/modules/auth/auth.dao"
import { generateId } from "../auth/auth.utilities"
import { OrganizationDAO } from "./organization.dao"
import type { CreateOrganizationDTO } from "./organization.dto"

export class OrganizationService {
  private orgDAO: OrganizationDAO
  private authDAO: AuthDAO

  constructor() {
    this.orgDAO = new OrganizationDAO()
    this.authDAO = new AuthDAO()
  }

  async getUserOrganizations(userId: string) {
    return await this.orgDAO.listUserOrganizations(userId)
  }

  async getOrganizationDetails(params: { orgId: string; userId: string }) {
    const membership = await this.orgDAO.getMembership({
      organizationId: params.orgId,
      userId: params.userId,
    })
    if (!membership) {
      throw ApiError.Forbidden("User is not a member of this organization")
    }

    const organization = await this.orgDAO.getOrganizationById(params.orgId)
    if (!organization) {
      throw ApiError.NotFound("Organization not found")
    }

    return { organization, membership }
  }

  async updateActiveOrganization(params: {
    orgId: string | null
    sessionId: string
    userId: string
  }) {
    if (params.orgId) {
      const membership = await this.orgDAO.getMembership({
        organizationId: params.orgId,
        userId: params.userId,
      })
      if (!membership) {
        throw ApiError.Forbidden("User is not a member of this organization")
      }
    }

    await this.authDAO.updateActiveOrganization({
      newActiveOrganizationId: params.orgId,
      sessionId: params.sessionId,
    })
  }

  async createOrganization(userId: string, data: CreateOrganizationDTO) {
    // Generate unique slug if not provided
    let slug = data.slug
    if (!slug) {
      slug = this.generateSlug(data.name)
    }

    // Check if slug is available
    if (slug) {
      const existing = await this.orgDAO.getOrganizationBySlug(slug)
      if (existing) {
        throw ApiError.Conflict("Organization slug already exists")
      }
    }

    // Create organization and make user the owner
    const organization = await this.orgDAO.createOrganization({
      ...data,
      slug,
    })

    await this.orgDAO.addOrganizationMember({
      organization_id: organization.id,
      user_id: userId,
      role: "owner",
    })

    return organization
  }

  async inviteMember(
    orgId: string,
    invitedByUserId: string,
    email: string,
    role: string = "member"
  ) {
    // Verify inviter has permissions
    const inviterMembership = await this.orgDAO.getMembership({
      organizationId: orgId,
      userId: invitedByUserId,
    })
    if (!inviterMembership || !["owner", "admin"].includes(inviterMembership.role)) {
      throw ApiError.Forbidden("Insufficient permissions to invite members")
    }

    // Check if user is already a member
    const existingUser = await this.authDAO.getUserByEmail(email)
    if (existingUser) {
      const existingMembership = await this.orgDAO.getMembership({
        organizationId: orgId,
        userId: existingUser.id,
      })
      if (existingMembership) {
        throw ApiError.Conflict("User is already a member of this organization")
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await this.orgDAO.getInvitationByEmailAndOrg(orgId, email)
    if (existingInvitation) {
      throw ApiError.Conflict("Invitation already sent to this email")
    }

    // Create invitation
    const invitation = await this.orgDAO.createInvitation({
      id: generateId(),
      organization_id: orgId,
      email: email.toLowerCase(),
      role,
      invited_by: invitedByUserId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    })

    // Fetch the organization details
    const organization = await this.orgDAO.getOrganizationById(orgId)
    if (!organization) {
      throw ApiError.NotFound("Organization not found")
    }

    const html = renderOrgInvitationEmail({ inviteLink: "", inviterName: "", orgName: "" })
    await sendEmail({
      html,
      subject: `You're invited to join ${organization.name}`,
      to: email,
    })

    return invitation
  }

  async acceptInvitation(invitationId: string, userId: string) {
    return await this.orgDAO.acceptInvitation(invitationId, userId)
  }

  async leaveOrganization(orgId: string, userId: string) {
    return await this.orgDAO.leaveOrganization(orgId, userId)
  }

  async removeMember(orgId: string, userId: string, requestedByUserId: string) {
    // Verify requester has permissions
    const requesterMembership = await this.orgDAO.getMembership({
      organizationId: orgId,
      userId: requestedByUserId,
    })
    if (!requesterMembership || !["owner", "admin"].includes(requesterMembership.role)) {
      throw ApiError.Forbidden("Insufficient permissions to remove members")
    }

    // Can't remove yourself through this endpoint
    if (userId === requestedByUserId) {
      throw ApiError.BadRequest("Use leave endpoint to remove yourself")
    }

    return await this.orgDAO.removeMember(orgId, userId)
  }

  async updateMemberRole(
    orgId: string,
    userId: string,
    newRole: string,
    requestedByUserId: string
  ) {
    // Verify requester has owner role
    const requesterMembership = await this.orgDAO.getMembership({
      organizationId: orgId,
      userId: requestedByUserId,
    })
    if (!requesterMembership || requesterMembership.role !== "owner") {
      throw ApiError.Forbidden("Only owners can change member roles")
    }

    // Prevent demoting the last owner
    if (newRole !== "owner") {
      const owners = await this.getOrganizationOwners(orgId)
      if (owners.length === 1 && owners[0].user_id === userId) {
        throw ApiError.BadRequest("Cannot demote the last owner")
      }
    }

    return await this.orgDAO.updateMembership(orgId, userId, newRole)
  }

  private async getOrganizationOwners(orgId: string) {
    return await this.orgDAO.getOrganizationOwners(orgId)
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50)
  }

  async getOrganizationMembers(orgId: string, userId: string) {
    // Verify user has access
    const membership = await this.orgDAO.getMembership({
      organizationId: orgId,
      userId: userId,
    })
    if (!membership) {
      throw ApiError.Forbidden("User is not a member of this organization")
    }

    return await this.orgDAO.getOrganizationMembers(orgId)
  }
}
