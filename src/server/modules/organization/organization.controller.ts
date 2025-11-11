import { Hono } from "hono"
import { describeRoute, validator as zValidator } from "hono-openapi"
import { z } from "zod"
import { authMiddleware, requireAuthMiddleware } from "../auth/auth.middleware"
import type { CreateOrganizationDTO } from "./organization.dto"
import { organizationMiddleware } from "./organization.middleware"
import { OrganizationService } from "./organization.service"

const orgService = new OrganizationService()

export const organizationController = new Hono<{
  Variables: {
    user: { id: string; username: string } | undefined
    session: { id: string; expiresAt: Date } | undefined
  }
}>()
  .use(describeRoute({ tags: ["Organization"] }))
  .use(authMiddleware, requireAuthMiddleware, organizationMiddleware)

  // Get user's organizations
  .get("/", describeRoute({}), async (c) => {
    const organizations = await orgService.getUserOrganizations(c.var.user.id)
    return c.json({ organizations })
  })

  // Get active organization details
  .get("/active", describeRoute({}), async (c) => {
    const activeOrganizationId = c.var.session?.active_organization_id

    if (!activeOrganizationId) {
      return c.json({ organization: null, membership: null })
    }

    const { organization, membership } = await orgService.getOrganizationDetails({
      orgId: activeOrganizationId,
      userId: c.var.user.id,
    })

    return c.json({ organization, membership })
  })

  // Set active organization
  .put(
    "/active",
    zValidator("json", z.object({ orgId: z.string().nullable() })),
    describeRoute({}),
    async (c) => {
      const { orgId } = c.req.valid("json")

      await orgService.updateActiveOrganization({
        orgId: orgId,
        sessionId: c.var.session.id,
        userId: c.var.user.id,
      })

      return c.json({ success: true })
    }
  )

  // Get organization details
  .get(
    "/:orgId",
    zValidator("param", z.object({ orgId: z.string() })),
    describeRoute({}),
    async (c) => {
      const { orgId } = c.req.valid("param")

      const { organization, membership } = await orgService.getOrganizationDetails({
        orgId: orgId,
        userId: c.var.user.id,
      })

      return c.json({ organization, membership })
    }
  )

  // Create organization
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string().min(1).max(255),
        slug: z.string().max(50).optional(),
        description: z.string().optional(),
      })
    ),
    describeRoute({}),
    async (c) => {
      const user = c.var.user
      const data = c.req.valid("json") as CreateOrganizationDTO
      const organization = await orgService.createOrganization(user.id, data)
      return c.json({ organization }, 201)
    }
  )

  // Get organization members
  .get(
    "/:orgId/members",
    zValidator("param", z.object({ orgId: z.string() })),
    describeRoute({}),
    async (c) => {
      const { orgId } = c.req.valid("param")
      const user = c.var.user
      const members = await orgService.getOrganizationMembers(orgId, user.id)
      return c.json({ members })
    }
  )

  // Invite member
  .post(
    "/:orgId/invite",
    zValidator("param", z.object({ orgId: z.string() })),
    zValidator(
      "json",
      z.object({
        email: z.email().min(1),
        role: z.enum(["member", "admin"]).optional(),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { orgId } = c.req.valid("param")
      const { email, role } = c.req.valid("json")
      const user = c.var.user
      const invitation = await orgService.inviteMember(orgId, user.id, email, role)
      return c.json({ invitation }, 201)
    }
  )

  // List pending invitations
  .get(
    "/:orgId/invitations",
    zValidator("param", z.object({ orgId: z.string() })),
    describeRoute({}),
    async (c) => {
      const { orgId } = c.req.valid("param")
      const user = c.var.user
      const invitations = await orgService.listPendingInvitations(orgId, user.id)
      return c.json({ invitations })
    }
  )

  // Get pending invitation details
  .get(
    "/invite/:invitationId",
    zValidator("param", z.object({ invitationId: z.string() })),
    describeRoute({}),
    async (c) => {
      const { invitationId } = c.req.valid("param")
      const user = c.var.user
      const invitation = await orgService.getPendingInvitation({
        invitationId,
        email: user.email,
      })
      return c.json({ invitation })
    }
  )

  // Revoke invitation
  .delete(
    "/:orgId/invitations/:invitationId",

    zValidator("param", z.object({ orgId: z.string(), invitationId: z.string() })),
    describeRoute({}),
    async (c) => {
      const { orgId, invitationId } = c.req.valid("param")
      const user = c.var.user
      await orgService.revokeInvitation(orgId, invitationId, user.id)
      return c.json({ success: true })
    }
  )

  // Accept invitation
  .post(
    "/invite/:invitationId/accept",

    zValidator("param", z.object({ invitationId: z.string() })),
    describeRoute({}),
    async (c) => {
      const { invitationId } = c.req.valid("param")
      const user = c.var.user
      await orgService.acceptInvitation(invitationId, user.id)
      return c.json({ success: true })
    }
  )

  // Leave organization
  .post(
    "/:orgId/leave",

    zValidator("param", z.object({ orgId: z.string() })),
    describeRoute({}),
    async (c) => {
      const { orgId } = c.req.valid("param")
      const user = c.var.user
      await orgService.leaveOrganization({
        orgId: orgId,
        userId: user.id,
        activeOrgId: c.var.session.active_organization_id,
        sessionId: c.var.session.id,
      })
      return c.json({ success: true })
    }
  )

  // Remove member
  .delete(
    "/:orgId/members/:userId",

    zValidator("param", z.object({ orgId: z.string(), userId: z.string() })),
    describeRoute({}),
    async (c) => {
      const { orgId, userId } = c.req.valid("param")
      const requestedByUserId = c.var.user.id
      await orgService.removeMember({ orgId, userId, requestedByUserId })
      return c.json({ success: true })
    }
  )

  // Update member role
  .patch(
    "/:orgId/members/:userId/role",

    zValidator("param", z.object({ orgId: z.string(), userId: z.string() })),
    zValidator(
      "json",
      z.object({
        role: z.enum(["member", "admin", "owner"]),
      })
    ),
    describeRoute({}),
    async (c) => {
      const { orgId, userId } = c.req.valid("param")
      const { role } = c.req.valid("json")
      const requestedByUserId = c.var.user.id
      await orgService.updateMemberRole(orgId, userId, role, requestedByUserId)
      return c.json({ success: true })
    }
  )

  // Delete organization
  .delete(
    "/:orgId",
    zValidator("param", z.object({ orgId: z.string() })),
    describeRoute({}),
    async (c) => {
      const { orgId } = c.req.valid("param")
      const userId = c.var.user.id
      await orgService.deleteOrganization({
        orgId: orgId,
        requestedByUserId: userId,
        activeOrgId: c.var.session.active_organization_id,
        sessionId: c.var.session.id,
      })
      return c.json({ success: true })
    }
  )
