import { Hono } from "hono"
import { describeRoute, validator as zValidator } from "hono-openapi"
import { z } from "zod"
import { requireAuthMiddleware } from "../auth/auth.middleware"
import type { CreateOrganizationDTO } from "./organization.dto"
import { OrganizationService } from "./organization.service"

const orgService = new OrganizationService()

export const organizationController = new Hono<{
  Variables: {
    user: { id: string; username: string } | undefined
    session: { id: string; expiresAt: Date } | undefined
  }
}>()
  .use(describeRoute({ tags: ["Organization"] }))

  // Get user's organizations
  .get("/", requireAuthMiddleware, describeRoute({}), async (c) => {
    const user = c.var.user
    const organizations = await orgService.getUserOrganizations(user.id)
    return c.json({ organizations })
  })

  // Get organization details
  .get(
    "/:orgId",
    requireAuthMiddleware,
    zValidator("param", z.object({ orgId: z.string() })),
    describeRoute({}),
    async (c) => {
      const { orgId } = c.req.valid("param")
      const user = c.var.user
      const { organization, membership } = await orgService.getOrganizationDetails(orgId, user.id)
      return c.json({ organization, membership })
    }
  )

  // Create organization
  .post(
    "/",
    requireAuthMiddleware,
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
    requireAuthMiddleware,
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
    requireAuthMiddleware,
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

  // Accept invitation
  .post(
    "/invite/:invitationId/accept",
    requireAuthMiddleware,
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
    requireAuthMiddleware,
    zValidator("param", z.object({ orgId: z.string() })),
    describeRoute({}),
    async (c) => {
      const { orgId } = c.req.valid("param")
      const user = c.var.user
      await orgService.leaveOrganization(orgId, user.id)
      return c.json({ success: true })
    }
  )

  // Remove member
  .delete(
    "/:orgId/members/:userId",
    requireAuthMiddleware,
    zValidator("param", z.object({ orgId: z.string(), userId: z.string() })),
    describeRoute({}),
    async (c) => {
      const { orgId, userId } = c.req.valid("param")
      const requestedByUserId = c.var.user.id
      await orgService.removeMember(orgId, userId, requestedByUserId)
      return c.json({ success: true })
    }
  )

  // Update member role
  .patch(
    "/:orgId/members/:userId/role",
    requireAuthMiddleware,
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
