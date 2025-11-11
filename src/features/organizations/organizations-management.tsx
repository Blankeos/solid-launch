import type { ColumnDef } from "@tanstack/solid-table"
import { useDisclosure, useDisclosureData } from "bagon-hooks"
import { createMemo, createSignal, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { toast } from "solid-sonner"
import z from "zod"
import { IconAlertFilled, IconDotsVertical, IconPlus, IconUpload } from "@/assets/icons"
import { ConfirmationDialog } from "@/components/confirm-dialog"
import { AlertComp } from "@/components/ui/alert"
import { AvatarComp } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible } from "@/components/ui/collapsible"
import { DataTable } from "@/components/ui/data-table/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuComp } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { SelectComp, type SelectOption } from "@/components/ui/select"
import { TagsInputComp } from "@/components/ui/tags-input"
import { TextFieldComp } from "@/components/ui/text-field"
import { formatDate } from "@/utils/format-date"
import { useAuthContext } from "../auth/auth.context"
import {
  type InvitationListItem,
  type MembersListItem,
  useOrganizations,
} from "./use-organizations"

function InviteForm(props: { onClose?: () => void }) {
  const { user } = useAuthContext()
  const { inviteMemberMutation } = useOrganizations({ queriesOnMount: [] })

  const [emails, setEmails] = createStore<string[]>([])
  const [emailsInput, setEmailsInput] = createSignal("")
  const [error, setError] = createSignal("")
  const [isSubmitting, setIsSubmitting] = createSignal(false)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    const emailList = emails
    if (!emailList.length) return

    setIsSubmitting(true)
    setError("")

    const orgId = user()?.active_organization_id
    if (!orgId) {
      setError("No organization selected")
      setIsSubmitting(false)
      return
    }

    const results = await Promise.allSettled(
      emailList.map((email) => inviteMemberMutation.mutateAsync({ orgId, email }))
    )

    const failedEmails: string[] = []
    const alreadyInvitedEmails: string[] = []

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const error = result.reason
        if (error?.message?.includes("Invitation already sent to this email")) {
          alreadyInvitedEmails.push(emailList[index])
        } else {
          failedEmails.push(emailList[index])
        }
      }
    })

    // Remove successfully invited emails from the emails array
    setEmails((prevEmails) =>
      prevEmails.filter((email) => {
        const index = emailList.indexOf(email)
        return index !== -1 && results[index].status === "rejected"
      })
    )

    if (failedEmails.length === 0 && alreadyInvitedEmails.length === 0) {
      toast.success("Invitations sent successfully")
      setEmails([])
      props.onClose?.()
    } else if (failedEmails.length > 0) {
      if (alreadyInvitedEmails.length > 0) {
        setError(
          `Failed to invite: ${failedEmails.join(", ")}. ${alreadyInvitedEmails.join(", ")} ${alreadyInvitedEmails.length === 1 ? "has already been invited" : "have already been invited"}.`
        )
      } else {
        setError(`Failed to invite: ${failedEmails.join(", ")}`)
      }
    } else if (alreadyInvitedEmails.length > 0) {
      setError(
        `${alreadyInvitedEmails.join(", ")} ${alreadyInvitedEmails.length === 1 ? "has already been invited" : "have already been invited"}.`
      )
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <div>
        <h3 class="mb-2 font-semibold">Invite New Members</h3>
        <p class="mb-4 text-muted-foreground text-sm">
          Enter or paste one or more email addresses, separated by spaces or commas.
        </p>
        <TagsInputComp
          placeholder={!emails.length ? "example@email.com, example2@gmail.com" : undefined}
          value={emails}
          onValueChange={(details) => {
            const { success } = z.email().min(1).array().safeParse(details.value)
            if (success) setEmails(() => details.value)
          }}
          inputValue={emailsInput()}
          onInputValueChange={(details) => {
            // Type of thing you can only do in solidjs lol this will cause unlimited re-renders in react I feel.
            if (details.inputValue === "") {
              const { success } = z.email().min(1).safeParse(emailsInput())
              if (!success) return
            }

            setEmailsInput(details.inputValue)
          }}
          onPaste={(e) => {
            e.preventDefault()
            const pastedData = e.clipboardData?.getData("text") || ""
            const emailSchema = z.email().min(1)
            const validEmails: string[] = []
            const invalidEmails: string[] = []

            pastedData
              .split(/[\s,]+/)
              .filter(Boolean)
              .forEach((email) => {
                try {
                  emailSchema.parse(email)
                  validEmails.push(email)
                } catch {
                  invalidEmails.push(email)
                }
              })

            setEmails(validEmails)
            if (invalidEmails.length > 0) {
              setEmailsInput(invalidEmails.join(", "))
            }
          }}
        />
      </div>
      <Show when={error()}>
        <AlertComp
          variant="destructive"
          icon={<IconAlertFilled />}
          title={error()}
          class="text-sm"
        />
      </Show>
      <div class="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={props.onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting()} disabled={!emails.length}>
          Send Invitations
        </Button>
      </div>
    </form>
  )
}

const OrganizationMembersTable = (props: { onOpenInvite?: () => void }) => {
  const { user } = useAuthContext()

  const {
    organizationMembersQuery,
    leaveOrganizationMutation,
    removeMemberMutation,
    updateMemberRoleMutation,
  } = useOrganizations({ queriesOnMount: ["organization-members"] })

  const [memberIdPending, setMemberIdPending] = createSignal()

  const { user: currentUser } = useAuthContext()

  const columns: ColumnDef<MembersListItem>[] = [
    {
      accessorKey: "email",
      header: "User",
      filterFn: (row, _, searchValue) => {
        const haystack = [row.original.email.toLowerCase()].filter(Boolean)
        const result = haystack.some((str) =>
          new RegExp(searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(str!)
        )
        return result
      },
      cell: (cell) => {
        const email = cell.row.original.email
        const userId = cell.row.original.user_id
        return (
          <div class="flex items-center gap-3">
            <AvatarComp
              class="size-8"
              src={cell.row.original.metadata.avatar_url}
              fallback={cell.row.original.metadata?.name?.charAt(0)}
            />
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="font-medium">{cell.row.original.metadata.name}</span>
                {userId === currentUser()?.id && (
                  <span class="rounded bg-primary/10 px-2 py-0.5 text-primary text-xs">You</span>
                )}
              </div>
              <span class="text-muted-foreground text-sm">{email}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "joined_at",
      header: "Joined",
      cell: (info) => {
        const date = new Date(info.row.original.joined_at)
        return date.toLocaleDateString()
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (info) => {
        const { user } = useAuthContext()

        const member = info.row.original

        const [role, setRole] = createSignal(info.getValue())
        const roleOptions: SelectOption[] = [
          { value: "owner", label: "Owner" },
          { value: "admin", label: "Admin" },
          { value: "member", label: "Member" },
        ]

        return (
          <SelectComp
            value={roleOptions.find((opt) => opt.value === role()) ?? null}
            onChange={(newVal) => {
              if (newVal?.value && newVal.value !== role()) {
                setMemberIdPending(member.user_id)

                updateMemberRoleMutation.mutate(
                  {
                    orgId: user()?.active_organization_id || "",
                    userId: member.user_id,
                    role: newVal.value as "member" | "admin" | "owner",
                  },
                  {
                    onSuccess: () => {
                      toast.success(`Updated role to ${newVal.value}`)
                    },
                    onError: (error) => {
                      toast.error(error.message)
                    },
                  }
                )
              }
            }}
            loading={member.user_id === memberIdPending() && updateMemberRoleMutation.isPending}
            disabled={updateMemberRoleMutation.isPending}
            options={roleOptions}
            placeholder="Select role"
            triggerProps={{ class: "text-xs h-8 w-[90px]" }}
          />
        )
      },
    },
    {
      id: "actions",
      cell: (info) => {
        const member = info.row.original
        return (
          <DropdownMenuComp
            options={[
              {
                type: "item",
                itemDisplay: user()?.id === member.user_id ? "Leave" : "Remove",
                itemOnSelect: () => {
                  const orgId = user()?.active_organization_id
                  if (!orgId) return

                  if (user()?.id === member.user_id) {
                    leaveOrganizationMutation.mutate(
                      { orgId: orgId },
                      {
                        onError: (error) => {
                          toast.error(error.message)
                        },
                      }
                    )
                  } else {
                    removeMemberMutation.mutate(
                      { orgId: orgId, userId: member.user_id },
                      {
                        onError: (error) => {
                          toast.error(error.message)
                        },
                      }
                    )
                  }
                },
              },
            ]}
          >
            <Button variant="ghost" size="icon" class="h-8 w-8">
              <IconDotsVertical class="size-4 rotate-90" />
            </Button>
          </DropdownMenuComp>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={organizationMembersQuery.data ?? []}
      toolbar={{
        searchable: {
          columns: ["email"],
          placeholder: "Search members...",
        },
        disableViewOptions: true,
        additionalJSX: () => (
          <Button onClick={props.onOpenInvite} variant="outline">
            <IconPlus /> Invite
          </Button>
        ),
      }}
      pagination={{ disabled: true }}
    />
  )
}

const InvitationsTable = () => {
  const { organizationInvitationsQuery, revokeInvitationMutation } = useOrganizations({
    queriesOnMount: ["organization-invitations"],
  })

  const columns: ColumnDef<InvitationListItem>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: (cell) => <span class="font-medium">{cell.getValue() as string}</span>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "invited_by",
      header: "Invited By",
      cell: (cell) => {
        const invitedBy = cell.row.original.invited_by_metadata
        return (
          <div class="flex items-center gap-2">
            <AvatarComp
              class="size-6"
              src={invitedBy.avatar_url}
              fallback={invitedBy.name?.charAt(0) ?? "?"}
            />
            <span>{invitedBy.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "invited_at",
      header: "Invited Date",
      cell: (cell) => {
        const date = new Date(cell.row.original.created_at)
        return date.toLocaleDateString()
      },
    },
    {
      id: "actions",
      cell: (info: any) => {
        const invite = info.row.original
        const { user } = useAuthContext()

        return (
          <DropdownMenuComp
            options={[
              {
                type: "item",
                itemDisplay: "Revoke",
                itemOnSelect: () => {
                  const orgId = user()?.active_organization_id
                  if (!orgId) return
                  revokeInvitationMutation.mutate(
                    { orgId: orgId, invitationId: invite.id },
                    {
                      onError: (error) => {
                        toast.error(error.message)
                      },
                    }
                  )
                },
              },
            ]}
          >
            <Button variant="ghost" size="icon" class="h-8 w-8">
              <IconDotsVertical class="size-4 rotate-90" />
            </Button>
          </DropdownMenuComp>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={organizationInvitationsQuery.data || []}
      toolbar={{
        searchable: {
          columns: ["email"],
          placeholder: "Search invitations...",
        },
        disableViewOptions: true,
      }}
      pagination={{ disabled: true }}
    />
  )
}

export function OrganizationsManagement() {
  const { user } = useAuthContext()

  const {
    listOrganizationsQuery,
    activeOrganizationQuery,
    setActiveOrganizationMutation,
    organizationMembersQuery,
    deleteOrganizationMutation,
  } = useOrganizations({
    queriesOnMount: ["list-organizations", "active-organization", "organization-members"],
  })

  const [inviteCollapseOpen, inviteCollapseActions] = useDisclosure()
  const [createOrganizationModalOpen, createOrganizationModalActions] = useDisclosure()
  const [deleteOrganizationModalData, deleteOrganizationModalOpen, deleteOrganizationModalActions] =
    useDisclosureData<{
      organizationId: string
      organizationName: string
      onConfirm: () => void
    }>()

  // Get organizations from the query result
  const organizations = createMemo(() => {
    const personalAccountOption = {
      value: "personal",
      label: () => (
        <div class="flex items-center gap-2">
          <AvatarComp class="size-4" fallback="P" />
          Personal Account
        </div>
      ),
    }

    const orgs =
      listOrganizationsQuery.data?.map((org) => ({
        value: org.id,
        label: () => (
          <div class="flex items-center gap-2">
            <AvatarComp class="size-4" src={org.member_created_at} fallback={org.name.charAt(0)} />
            {org.name}
            <span class="text-foreground/50 text-xs">{org.slug}</span>
          </div>
        ),
      })) || []

    return [personalAccountOption, ...orgs]
  })

  return (
    <section class="">
      <Card class="mb-5 overflow-hidden">
        <CardHeader>
          <CardTitle class="text-base">Organizations</CardTitle>
          <CardDescription>Manage your organizations</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-y-3">
            {/* 🪲 DEBUGGER */}
            {/*<pre>{JSON.stringify(user(), null, 2)}</pre>*/}
            {/*<pre>{JSON.stringify(activeOrganizationQuery.data, null, 2)}</pre>*/}

            <div class="flex gap-2">
              <SelectComp
                class="flex-1"
                value={
                  organizations().find(
                    (opt) => opt.value === (user()?.active_organization_id ?? "personal")
                  ) ?? null
                }
                loading={setActiveOrganizationMutation.isPending}
                onChange={(newValue) => {
                  try {
                    if (newValue) {
                      if (newValue.value === "personal")
                        setActiveOrganizationMutation.mutate({ organizationId: null })
                      else setActiveOrganizationMutation.mutate({ organizationId: newValue.value })
                    }
                  } catch (error: any) {
                    toast.error(`${error.message}`)
                  }
                }}
                options={organizations()}
                placeholder={
                  organizations().length ? "Select organization" : "No organizations yet"
                }
                disabled={!organizations().length}
              />
              <Button variant="outline" onClick={createOrganizationModalActions.open}>
                <IconPlus />
                Create
              </Button>
            </div>

            <Show when={user()?.active_organization_id}>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground text-sm">Name</span>
                <span class="font-medium text-sm">
                  {activeOrganizationQuery.data?.organization?.name}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground text-sm">Slug</span>
                <span class="font-medium text-muted-foreground/80 text-sm">
                  {activeOrganizationQuery.data?.organization?.slug}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground text-sm">Created</span>
                <span class="font-medium text-sm">
                  {formatDate(activeOrganizationQuery.data?.organization?.created_at ?? "")}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground text-sm">Members</span>
                <span class="font-medium text-sm">
                  {organizationMembersQuery.data?.length || 0}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground text-sm">My Role</span>
                <span class="font-medium text-sm">
                  {activeOrganizationQuery.data?.membership?.role}
                </span>
              </div>
            </Show>

            {/*<div class="flex items-center justify-between">
              <span class="text-muted-foreground text-sm">Members</span>
              <AvatarComp src={activeOrganizationQuery?.data?.organization?.logo_object_id} />
            </div>*/}

            <Show
              when={
                user()?.active_organization_id &&
                activeOrganizationQuery?.data?.membership?.role === "owner"
              }
            >
              <Button
                variant="destructive"
                size="sm"
                class="self-end"
                loading={deleteOrganizationMutation.isPending}
                onClick={() => {
                  const orgId = activeOrganizationQuery.data?.organization?.id
                  if (!orgId) return

                  deleteOrganizationModalActions.open({
                    organizationId: orgId,
                    organizationName: activeOrganizationQuery.data?.organization?.name ?? "",
                    onConfirm: async () => {
                      await deleteOrganizationMutation.mutateAsync(
                        { orgId: orgId },
                        {
                          onError: (error) => {
                            toast.error(error.message)
                          },
                        }
                      )
                    },
                  })
                }}
              >
                Delete
              </Button>
            </Show>
          </div>
        </CardContent>
      </Card>

      <Card class="mb-5 overflow-hidden">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="text-base">Organization Members</CardTitle>
              <CardDescription>Manage members in your organization</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent class="px-0">
          <Collapsible open={inviteCollapseOpen()} class="px-6 pb-4">
            <InviteForm onClose={inviteCollapseActions.close} />
          </Collapsible>

          <div class="px-6 pb-5">
            {/* 🪲 DEBUGGING*/}
            {/*<pre>
              current org: {JSON.stringify(user()?.active_organization_id, null, 2)}
              <br />
              members: {JSON.stringify(organizationMembersQuery.data, null, 2)}
              <br />
              itlog
            </pre>*/}
            <OrganizationMembersTable onOpenInvite={inviteCollapseActions.open} />
          </div>
        </CardContent>
      </Card>

      <Card class="overflow-hidden">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="text-base">Pending Invitations</CardTitle>
              <CardDescription>View and manage pending invitations</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent class="px-0">
          <div class="px-6 pb-5">
            <InvitationsTable />
          </div>
        </CardContent>
      </Card>

      <CreateOrganizationModal
        open={createOrganizationModalOpen()}
        onOpenChange={createOrganizationModalActions.set}
      />
      <ConfirmationDialog
        title={`Delete: ${deleteOrganizationModalData()?.organizationName}?`}
        description="This action cannot be reversed. Make sure you have no dependencies (i.e. billing), you are the sole owner, and inform your members."
        open={deleteOrganizationModalOpen()}
        onConfirm={deleteOrganizationModalData()?.onConfirm ?? (() => {})}
        onOpenChange={(open) => !open && deleteOrganizationModalActions.close()}
      />
    </section>
  )
}
const CreateOrganizationModal = (props?: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const [name, setName] = createSignal("")
  const [slug, setSlug] = createSignal("")
  const [description, setDescription] = createSignal("")

  const { createOrganizationMutation } = useOrganizations({ queriesOnMount: [] })

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleNameChange = (value: string) => {
    setName(value)
    setSlug(generateSlug(value))
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    await createOrganizationMutation.mutateAsync(
      {
        name: name(),
        slug: slug() || undefined,
        description: description() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Created organization`)
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
    props?.onOpenChange(false)
  }

  return (
    <Dialog open={props?.open} onOpenChange={props?.onOpenChange}>
      <DialogContent class="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} class="space-y-4">
          <DialogHeader>
            <DialogTitle>Create organization</DialogTitle>
            <DialogDescription>
              Create a new organization to collaborate with your team
            </DialogDescription>
          </DialogHeader>

          <div class="space-y-4 py-4">
            <div class="flex flex-col">
              <Label>Logo</Label>
              <div class="mt-1 flex items-center gap-4">
                <button
                  type="button"
                  class="relative size-16 overflow-hidden rounded-lg bg-muted ring-muted-foreground focus:ring-2"
                >
                  {false && (
                    <img
                      alt="org logo"
                      src="https://via.placeholder.com/64"
                      class="size-16 rounded-lg object-cover"
                    />
                  )}
                  <span class="absolute inset-0 flex items-center justify-center">
                    <IconUpload />
                  </span>
                </button>

                <div class="flex-1 space-y-1">
                  <Button size="sm" variant="secondary">
                    Upload
                  </Button>
                  <p class="text-muted-foreground text-xs">Recommended size 1:1, up to 10MB</p>
                </div>
              </div>
            </div>

            <TextFieldComp
              label="Organization Name"
              placeholder="Enter organization name"
              value={name()}
              onChange={(value) => handleNameChange(value)}
              required
            />

            <div class="space-y-2">
              <TextFieldComp
                label="Organization Slug"
                placeholder="Enter organization slug"
                value={slug()}
                onChange={(value) => setSlug(generateSlug(value))}
                description="The slug will be used in your organization URL"
                required
              />
              <p class="text-muted-foreground/50 text-xs">
                https://app.example.com/org/{slug() || "slug"}
              </p>
            </div>
          </div>

          <DialogFooter class="items-end gap-2">
            <Button type="submit" loading={createOrganizationMutation.isPending}>
              Create organization
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
