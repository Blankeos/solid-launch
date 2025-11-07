import type { ColumnDef } from "@tanstack/solid-table"
import { useDisclosure } from "bagon-hooks"
import { createSignal, Show } from "solid-js"
import z from "zod"
import { IconAlertFilled, IconDotsVertical, IconPlus } from "@/assets/icons"
import { AlertComp } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible } from "@/components/ui/collapsible"
import { DataTable } from "@/components/ui/data-table/data-table"
import { DropdownMenuComp } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { SelectComp, type SelectOption } from "@/components/ui/select"
import { TagsInputComp } from "@/components/ui/tags-input"
import { useAuthContext } from "./auth.context"

const organizations = [
  { value: "org-1", label: "Acme Corp" },
  { value: "org-2", label: "Globex Inc" },
]

const members = [
  {
    id: "1",
    user: { name: "John Doe", email: "john@example.com", image: "https://github.com/shadcn.png" },
    joined_at: "2024-01-15",
    role: "admin",
  },
  {
    id: "2",
    user: { name: "Jane Smith", email: "jane@example.com", image: "https://github.com/shadcn.png" },
    joined_at: "2024-02-20",
    role: "member",
  },
  {
    id: "019a5f27-7240-7000-9612-83805086ef1f",
    user: { name: "Carlo", email: "carlo@gmail.com", image: "https://github.com/shadcn.png" },
    joined_at: "2024-03-10",
    role: "admin",
  },
]

function InviteForm(props: { onClose?: () => void }) {
  const [emails, setEmails] = createSignal<string[]>([])
  const [emailsInput, setEmailsInput] = createSignal("")
  const [error] = createSignal("carlo@gmail.com is already a member of the organization.")

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    // Handle invitation logic
  }

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <div>
        <h3 class="mb-2 font-semibold">Invite New Members</h3>
        <p class="mb-4 text-muted-foreground text-sm">
          Enter or paste one or more email addresses, separated by spaces or commas.
        </p>
        <TagsInputComp
          placeholder={!emails().length ? "example@email.com, example2@gmail.com" : undefined}
          value={emails()}
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
          // description={error()}
          title={error()}
          class="text-sm"
        />
      </Show>
      <div class="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={props.onClose}>
          Cancel
        </Button>
        <Button type="submit">Send Invitations</Button>
      </div>
    </form>
  )
}

export function OrganizationsManagement() {
  const [selectedOrg, setSelectedOrg] = createSignal("org-1")
  const { user: currentUser } = useAuthContext()

  const [inviteCollapseOpen, inviteCollapseActions] = useDisclosure()

  const OrganizationMembersTable = () => {
    const columns: ColumnDef<{
      id: string
      user: { name: string; email: string; image: string }
      joined_at: string
      role: string
    }>[] = [
      {
        accessorKey: "user",
        header: "User",
        filterFn: (row, _, searchValue) => {
          const haystack = [
            row.original.user?.name.toLowerCase(),
            row.original.user?.email.toLowerCase(),
          ].filter(Boolean)
          const result = haystack.some((str) =>
            new RegExp(searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(str!)
          )
          return result
        },
        cell: (cell) => {
          const user = cell.row.original.user
          const userId = cell.row.original.id
          return (
            <div class="flex items-center gap-3">
              <img src={user.image} alt={user.name} class="size-8 rounded-full" />
              <div class="flex items-center gap-2">
                <span class="font-medium">{user.name}</span>
                {userId === currentUser()?.id && (
                  <span class="rounded bg-primary/10 px-2 py-0.5 text-primary text-xs">You</span>
                )}
                <span class="text-muted-foreground text-sm">{user.email}</span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "joined_at",
        header: "Joined",
        cell: (info: any) => {
          const date = new Date(info.getValue())
          return date.toLocaleDateString()
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: (info: any) => {
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
                if (newVal?.value) {
                  setRole(newVal.value)
                }
              }}
              options={roleOptions}
              placeholder="Select role"
              triggerProps={{ class: "text-xs h-8 w-[90px]" }}
            />
          )
        },
      },
      {
        id: "actions",
        cell: (info: any) => {
          const member = info.row.original
          return (
            <DropdownMenuComp
              options={[
                {
                  type: "item",
                  itemDisplay: "Remove",
                  itemOnSelect: () => {
                    // Handle remove member
                    console.log("Remove member", member.id)
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
        data={members}
        toolbar={{
          searchable: {
            columns: ["user"],
            placeholder: "Search members...",
          },
          disableViewOptions: true,
          additionalJSX: () => (
            <Button onClick={inviteCollapseActions.open} variant="outline">
              <IconPlus /> Invite
            </Button>
          ),
        }}
        pagination={{ disabled: true }}
      />
    )
  }

  const InvitationsTable = () => {
    const columns: ColumnDef<{
      id: string
      email: string
      invited_at: string
      role: string
      invited_by: { name: string; email: string }
    }>[] = [
      {
        accessorKey: "email",
        header: "Email",
        cell: (cell) => <span class="font-medium">{cell.getValue()}</span>,
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
          const invitedBy = cell.getValue()
          return <span>{invitedBy.name}</span>
        },
      },
      {
        accessorKey: "invited_at",
        header: "Invited Date",
        cell: (info: any) => {
          const date = new Date(info.getValue())
          return date.toLocaleDateString()
        },
      },
      {
        id: "actions",
        cell: (info: any) => {
          const invite = info.row.original
          return (
            <DropdownMenuComp
              options={[
                {
                  type: "item",
                  itemDisplay: "Revoke",
                  itemOnSelect: () => {
                    // Handle revoke invitation
                    console.log("Revoke invitation", invite.id)
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

    const invitations = [
      {
        id: "1",
        email: "alice@example.com",
        invited_at: "2024-05-15",
        role: "member",
        invited_by: { name: "John Doe", email: "john@example.com" },
      },
      {
        id: "2",
        email: "bob@example.com",
        invited_at: "2024-05-16",
        role: "admin",
        invited_by: { name: "Jane Smith", email: "jane@example.com" },
      },
    ]

    return (
      <DataTable
        columns={columns}
        data={invitations}
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

  return (
    <div class="">
      <Card class="mb-5 overflow-hidden">
        <CardHeader>
          <CardTitle class="text-base">Organizations</CardTitle>
          <CardDescription>Manage your organizations</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <Label>Active Organization</Label>
            <div class="flex gap-2">
              <SelectComp
                class="flex-1"
                value={organizations.find((opt) => opt.value === selectedOrg()) ?? null}
                onChange={(newVal) => {
                  if (newVal?.value) {
                    setSelectedOrg(newVal.value)
                  }
                }}
                options={organizations}
                placeholder="Select organization"
              />
              <Button variant="outline">
                <IconPlus />
                Create
              </Button>
            </div>
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
            <OrganizationMembersTable />
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
    </div>
  )
}
