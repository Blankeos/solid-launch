import * as hono_hono_base from "hono/hono-base"
import * as hono_utils_types from "hono/utils/types"
import * as hono_utils_http_status from "hono/utils/http-status"
import * as hono_types from "hono/types"
import { Selectable } from "kysely"
import { User, Session } from "@/server/db/types"

type CauseType = {
  data?: any
  error?: Error
}
/** The standard type returned by the central handler. */
type ApiErrorResponse = {
  error: {
    message: string
    code: number
    cause?: CauseType
    stack?: string
  }
}

type InternalUserDTO = Selectable<User>
type InternalSessionDTO = Selectable<Session>
declare function getUserResponseDTO(
  user: InternalUserDTO,
  session: InternalSessionDTO
): Promise<{
  id: string
  email: string
  email_verified: number
  joined_at: string
  updated_at: string
  metadata: {
    name?: string
    avatar_url?: string
  }
  active_organization_id: string | null
}>
type UserResponseDTO = Awaited<ReturnType<typeof getUserResponseDTO>>

declare const appRouter: hono_hono_base.HonoBase<
  hono_types.BlankEnv,
  | hono_types.BlankSchema
  | hono_types.MergeSchemaPath<
      {
        "/verify-email": {}
      } & {
        "/": {
          $get: {
            input: {}
            output: {
              user: {
                id: string
                email: string
                email_verified: number
                joined_at: string
                updated_at: string
                metadata: {
                  name?: string | undefined
                  avatar_url?: string | undefined
                }
                active_organization_id: string | null
              } | null
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/profile": {
          $get: {
            input: {}
            output: {
              user: {
                id: string
                email: string
                email_verified: boolean
                metadata: {
                  name?: string | undefined
                  avatar_url?: string | undefined
                }
                joined_at: string
                updated_at: string
                oauth_accounts: {
                  provider: string
                  provider_user_id: string
                }[]
                active_sessions: {
                  display_id: string
                  revoke_id: string
                  expires_at: string
                  ip_address: string | null
                  device_name: string
                }[]
              }
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/profile": {
          $put: {
            input: {
              json: {
                username?: string | undefined
                name?: string | undefined
                avatar_object_id?: string | undefined
              }
            }
            output: {
              user: {
                success: boolean
              }
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/profile/avatar/upload-url": {
          $post: {
            input: {}
            output: {
              uploadUrl: string
              objectKey: string
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/profile/avatar/:uniqueId": {
          $get: {
            input: {
              param: {
                uniqueId: string
              }
            }
            output: undefined
            outputFormat: "redirect"
            status: 302
          }
        }
      } & {
        "/login": {
          $post: {
            input: {
              json: {
                email: string
                password: string
              }
            }
            output: {
              user: {
                id: string
                email: string
                email_verified: number
                joined_at: string
                updated_at: string
                metadata: {
                  name?: string | undefined
                  avatar_url?: string | undefined
                }
                active_organization_id: string | null
              }
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/logout": {
          $get: {
            input: {}
            output: {
              success: true
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/revoke": {
          $post: {
            input: {
              json: {
                revokeId: string
              }
            }
            output: {
              success: true
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/register": {
          $post: {
            input: {
              json: {
                email: string
                password: string
              }
            }
            output: {
              user: {
                id: string
                email: string
                email_verified: number
                joined_at: string
                updated_at: string
                metadata: {
                  name?: string | undefined
                  avatar_url?: string | undefined
                }
                active_organization_id: string | null
              }
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/login/google": {
          $get: {
            input: {
              query: {
                redirect_url?: string | undefined
                client_code_challenge?: string | undefined
              }
            }
            output: undefined
            outputFormat: "redirect"
            status: 302
          }
        }
      } & {
        "/login/google/callback": {
          $get: {
            input: {}
            output: undefined
            outputFormat: "redirect"
            status: 302
          }
        }
      } & {
        "/login/github": {
          $get: {
            input: {
              query: {
                redirect_url?: string | undefined
                client_code_challenge?: string | undefined
              }
            }
            output: undefined
            outputFormat: "redirect"
            status: 302
          }
        }
      } & {
        "/login/github/callback": {
          $get: {
            input: {}
            output: undefined
            outputFormat: "redirect"
            status: 302
          }
        }
      } & {
        "/login/token": {
          $post: {
            input: {
              json: {
                auth_code: string
                code_verifier: string
              }
            }
            output: {
              user: {
                id: string
                email: string
                email_verified: number
                joined_at: string
                updated_at: string
                metadata: {
                  name?: string | undefined
                  avatar_url?: string | undefined
                }
                active_organization_id: string | null
              }
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/login/otp": {
          $post: {
            input: {
              json: {
                email: string
              }
            }
            output: {
              success: true
              userId: string
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/login/otp/verify": {
          $post: {
            input: {
              json: {
                userId: string
                code: string
              }
            }
            output: {
              user: {
                id: string
                email: string
                email_verified: number
                joined_at: string
                updated_at: string
                metadata: {
                  name?: string | undefined
                  avatar_url?: string | undefined
                }
                active_organization_id: string | null
              }
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/login/magic-link": {
          $post: {
            input: {
              json: {
                email: string
              }
            }
            output: {
              success: true
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/login/magic-link/verify": {
          $get: {
            input: {
              query: {
                token: string
                fallback_url?: string | undefined
              }
            }
            output: undefined
            outputFormat: "redirect"
            status: 302
          }
        }
      } & {
        "/forgot-password": {
          $post: {
            input: {
              json: {
                email: string
              }
            }
            output: {
              success: true
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/forgot-password/verify": {
          $get: {
            input: {
              query: {
                token: string
              }
            }
            output: undefined
            outputFormat: "redirect"
            status: 302
          }
        }
      } & {
        "/forgot-password/verify": {
          $post: {
            input: {
              json: {
                token: string
                newPassword: string
              }
            }
            output: {
              success: boolean
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/verify-email": {
          $post: {
            input: {
              json: {
                email: string
              }
            }
            output: {
              success: true
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/verify-email/verify": {
          $get: {
            input: {
              query: {
                token: string
                fallback_url?: string | undefined
              }
            }
            output: undefined
            outputFormat: "redirect"
            status: 302
          }
        }
      },
      "/auth"
    >
  | hono_types.MergeSchemaPath<
      {
        "/": {
          $get: {
            input: {}
            output: {
              organizations: {
                metadata:
                  | {
                      billing_tier?: "free" | "pro" | "enterprise" | undefined
                      features?: string[] | undefined
                    }
                  | null
                  | undefined
                id: string
                updated_at: string
                name: string
                slug: string | null
                created_at: string
                role: string
                member_created_at: string
              }[]
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/active": {
          $get:
            | {
                input: {}
                output: {
                  organization: null
                  membership: null
                }
                outputFormat: "json"
                status: hono_utils_http_status.ContentfulStatusCode
              }
            | {
                input: {}
                output: {
                  organization: {
                    id: string
                    metadata: hono_utils_types.JSONValue
                    updated_at: string
                    name: string
                    slug: string | null
                    logo_object_id: string | null
                    created_at: string
                  }
                  membership: {
                    user_id: string
                    created_at: string
                    organization_id: string
                    role: string
                  }
                }
                outputFormat: "json"
                status: hono_utils_http_status.ContentfulStatusCode
              }
        }
      } & {
        "/active": {
          $put: {
            input: {
              json: {
                orgId: string | null
              }
            }
            output: {
              success: true
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/:orgId": {
          $get: {
            input: {
              param: {
                orgId: string
              }
            }
            output: {
              organization: {
                id: string
                metadata: hono_utils_types.JSONValue
                updated_at: string
                name: string
                slug: string | null
                logo_object_id: string | null
                created_at: string
              }
              membership: {
                user_id: string
                created_at: string
                organization_id: string
                role: string
              }
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/": {
          $post: {
            input: {
              json: {
                name: string
                slug?: string | undefined
                description?: string | undefined
              }
            }
            output: {
              organization: {
                id: string
                metadata: hono_utils_types.JSONValue
                updated_at: string
                name: string
                slug: string | null
                logo_object_id: string | null
                created_at: string
              }
            }
            outputFormat: "json"
            status: 201
          }
        }
      } & {
        "/:orgId/members": {
          $get: {
            input: {
              param: {
                orgId: string
              }
            }
            output: {
              members: {
                metadata: {
                  name?: string | undefined
                  avatar_url?: string | undefined
                }
                email: string
                email_verified: number
                joined_at: string
                organization_id: string
                updated_at: string
                user_id: string
                created_at: string
                role: string
              }[]
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/:orgId/invite": {
          $post: {
            input: {
              param: {
                orgId: string
              }
            } & {
              json: {
                email: string
                role?: "member" | "admin" | undefined
              }
            }
            output: {
              invitation: {
                id: string
                email: string
                expires_at: string
                created_at: string
                organization_id: string
                role: string
                invited_by_id: string
                accepted_at: string | null
                rejected_at: string | null
              }
            }
            outputFormat: "json"
            status: 201
          }
        }
      } & {
        "/:orgId/invitations": {
          $get: {
            input: {
              param: {
                orgId: string
              }
            }
            output: {
              invitations: {
                invited_by_metadata: {
                  name?: string | undefined
                  avatar_url?: string | undefined
                }
                invited_by_id: string
                id: string
                email: string
                expires_at: string
                created_at: string
                organization_id: string
                role: string
                accepted_at: string | null
                rejected_at: string | null
                invited_by_email: string
              }[]
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/invite/:invitationId": {
          $get: {
            input: {
              param: {
                invitationId: string
              }
            }
            output: {
              invitation:
                | {
                    invited_by_metadata: {
                      name?: string | undefined
                      avatar_url?: string | undefined
                    }
                    id: string
                    email: string
                    expires_at: string
                    created_at: string
                    organization_id: string
                    role: string
                    invited_by_id: string
                    accepted_at: string | null
                    rejected_at: string | null
                    organization_name: string
                    member_count: string | number | null
                  }
                | undefined
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/:orgId/invitations/:invitationId": {
          $delete: {
            input: {
              param: {
                orgId: string
                invitationId: string
              }
            }
            output: {
              success: true
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/invite/:invitationId/accept": {
          $post: {
            input: {
              param: {
                invitationId: string
              }
            }
            output: {
              success: true
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/:orgId/leave": {
          $post: {
            input: {
              param: {
                orgId: string
              }
            }
            output: {
              success: true
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/:orgId/members/:userId": {
          $delete: {
            input: {
              param: {
                orgId: string
                userId: string
              }
            }
            output: {
              success: true
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/:orgId/members/:userId/role": {
          $patch: {
            input: {
              param: {
                orgId: string
                userId: string
              }
            } & {
              json: {
                role: "member" | "admin" | "owner"
              }
            }
            output: {
              success: true
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      } & {
        "/:orgId": {
          $delete: {
            input: {
              param: {
                orgId: string
              }
            }
            output: {
              success: true
            }
            outputFormat: "json"
            status: hono_utils_http_status.ContentfulStatusCode
          }
        }
      },
      "/auth/organizations"
    >
  | hono_types.MergeSchemaPath<
      {
        "/checkout/:variantId": {
          $get: {
            input: {
              param: {
                variantId: string
              }
            }
            output: undefined
            outputFormat: "redirect"
            status: 302
          }
        }
      } & {
        "/webhook": {
          $post:
            | {
                input: {}
                output: "OK"
                outputFormat: "text"
                status: 200
              }
            | {
                input: {}
                output: "Bad Request"
                outputFormat: "text"
                status: 400
              }
        }
      },
      "/payments"
    >
  | hono_types.MergeSchemaPath<hono_types.BlankSchema, "/testmail">,
  "/"
>
type AppRouter = typeof appRouter

export { appRouter }
export type { ApiErrorResponse, AppRouter, UserResponseDTO }
