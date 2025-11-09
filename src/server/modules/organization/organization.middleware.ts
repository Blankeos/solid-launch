import { createMiddleware } from "hono/factory"
import type { RequireAuthMiddlewareBindings } from "../auth/auth.middleware"
import { OrganizationService } from "./organization.service"

const organizationService = new OrganizationService()
type OrganizationDetails = Awaited<ReturnType<typeof organizationService.getOrganizationDetails>>

export type OrganizationMiddlewareBindings = RequireAuthMiddlewareBindings & {
  Variables: {
    getActiveOrganization: () => Promise<OrganizationDetails | null>
    _activeOrganizationCache: OrganizationDetails | null // request context cache
  }
}

export const organizationMiddleware = createMiddleware<OrganizationMiddlewareBindings>(
  async (c, next) => {
    if (!c.var.session) {
      return next()
    }

    c.set("getActiveOrganization", async () => {
      if (!c.var.session.active_organization_id) return null

      // Cache in request context to avoid duplicate queries
      const cached = c.get("_activeOrganizationCache")
      if (cached) return cached

      const result = await organizationService.getOrganizationDetails({
        orgId: c.var.session.active_organization_id,
        userId: c.var.user.id,
      })

      c.set("_activeOrganizationCache", result)

      return result
    })

    return next()
  }
)
