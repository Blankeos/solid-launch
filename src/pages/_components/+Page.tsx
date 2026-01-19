import type { ColumnDef } from "@tanstack/solid-table"
import { useDisclosure, useToggle } from "bagon-hooks"
import { createEffect, createSignal, type FlowProps, For } from "solid-js"
import type { JSX } from "solid-js/jsx-runtime"
import { toast } from "solid-sonner"
import { followCursor } from "tippy.js"
import { IconMoonDuo, IconSunDuo } from "@/assets/icons"
import { AccordionComp } from "@/components/ui/accordion"
import { AlertComp } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { BreadcrumbComp } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { CalloutComp } from "@/components/ui/callout"
import { CheckboxComp } from "@/components/ui/checkbox"
import { Collapsible } from "@/components/ui/collapsible"
import { Combobox2Comp } from "@/components/ui/combobox-2"
import { ContextMenuComp } from "@/components/ui/context-menu"
import { DataTable } from "@/components/ui/data-table/data-table"
import { TableColumnHeader } from "@/components/ui/data-table/table-column-header"
import { CalendarComp, CalendarRangeComp } from "@/components/ui/date-picker/calendar-comp"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { DropdownMenuComp } from "@/components/ui/dropdown-menu"
import { PaginationComp } from "@/components/ui/pagination"
import { PopoverComp } from "@/components/ui/popover"
import { RadioGroupComp } from "@/components/ui/radio-group"
import { SelectComp, type SelectOption } from "@/components/ui/select"
import { SliderComp } from "@/components/ui/slider"
import { SwitchComp } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Timeline } from "@/components/ui/timeline"
import { useThemeContext } from "@/contexts/theme.context"
import { Tippy } from "@/lib/solid-tippy"
import { cn } from "@/utils/cn"
import { DragExample } from "./drag-example"
import { ScrollPaginationExample } from "./scroll-pagination-example"

export default function ComponentsPage() {
  return (
    <div class="flex flex-wrap gap-4 p-4">
      <header class="w-full">
        <h1 class="text-sm">Components</h1>
        <div class="text-foreground/50 text-xs">
          <p class="mb-1">
            Here, you will find my polished and preferred best practices for components usage with
            solid-ui. I took the flexibility from Shadcn + the concise data-driven dev ergonomics
            from Antd.
          </p>
          <p>
            The core drivers here are solid-ui, kobalte, bagon-hooks, css animations, and just plain
            old solid primitives. Simple and easy to read/write. Seriously!
          </p>
        </div>
      </header>
      <ComponentCard label="Button">
        <Button>Info</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="ghost">Ghost</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Loading...</Button>
      </ComponentCard>
      <ComponentCard label="Dropdown">
        <DropdownMenuComp
          options={[
            { type: "item", itemDisplay: "Commit", itemTip: "⌘+K" },
            { type: "item", itemDisplay: "Push", itemTip: "⇧+⌘+K" },
            { type: "item", itemDisplay: "Update Project", itemTip: "⌘+T" },
            {
              type: "sub",
              subTrigger: "GitHub",
              subOptions: [
                { type: "item", itemDisplay: "Create Pull Request…" },
                { type: "item", itemDisplay: "View Pull Requests" },
                { type: "item", itemDisplay: "Sync Forks" },
                { type: "separator" },
                {
                  type: "sub",
                  subTrigger: "itlog",
                  subOptions: [
                    {
                      type: "item",
                      itemDisplay: "123",
                    },
                    { type: "separator" },
                  ],
                },
                {
                  type: "item",
                  itemDisplay: "Open on GitHub",
                },
              ],
            },
            { type: "separator" },
            { type: "checkbox", label: "Show Git log" },
            { type: "checkbox", label: "Show History" },
            { type: "separator" },
            { type: "label", label: "Radio Group" },
            {
              type: "radio",
              options: [{ value: "main" }, { value: "develop" }],
            },
          ]}
        >
          <Button as="div">Open options</Button>
        </DropdownMenuComp>
      </ComponentCard>
      <ComponentCard label="Switch" class="gap-y-5">
        <SwitchComp label="Enable" />
        {(() => {
          const { inferredTheme, toggleTheme } = useThemeContext()

          return (
            <SwitchComp
              label={
                inferredTheme() === "light" ? (
                  <IconMoonDuo class="h-5 w-5" />
                ) : (
                  <IconSunDuo class="h-5 w-5" />
                )
              }
              checked={inferredTheme() === "light"}
              onChange={toggleTheme}
            />
          )
        })()}
      </ComponentCard>
      <ComponentCard label="Select" class="w-96">
        <span class="text-xs">Basic</span>
        <SelectComp
          options={[
            { value: "apple", label: "🍎 Apple" },
            { value: "orange", label: "🍊 Orange" },
            { value: "grape", label: "🍇 Grape" },
          ]}
        />
        <span class="text-xs">Multiple</span>
        <SelectComp
          multiple
          options={[
            { value: "apple", label: "🍎 Apple" },
            { value: "orange", label: "🍊 Orange" },
            { value: "grape", label: "🍇 Grape" },
          ]}
        />
        <SelectComp loading options={[]} placeholder="Loading" />
        <SelectComp disabled options={[]} placeholder="Disabled" />
        {(() => {
          const [value, setValue] = createSignal<string | null>("apple")
          const options: SelectOption[] = [
            { value: "apple", label: "🍎 Apple" },
            { value: "orange", label: "🍊 Orange" },
            { value: "grape", label: "🍇 Grape" },
          ]

          return (
            <>
              <span class="text-xs">
                Basic (Controlled {value() ? `- ${JSON.stringify(value())}` : null})
              </span>
              <SelectComp
                options={options}
                value={options.find((_opt) => _opt.value === value())}
                onChange={(newValue) => {
                  setValue(newValue?.value ?? null)
                }}
              />
            </>
          )
        })()}
        {(() => {
          const [value, setValue] = createSignal(["apple", "orange"])
          const options: SelectOption[] = [
            { value: "apple", label: "🍎 Apple" },
            { value: "orange", label: "🍊 Orange" },
            { value: "grape", label: "🍇 Grape" },
          ]

          return (
            <>
              <span class="text-xs">
                Multiple (Controlled {value() ? `- ${JSON.stringify(value())}` : null})
              </span>

              <SelectComp
                multiple
                options={options}
                value={options.filter((_opt) => value().includes(_opt.value))}
                onChange={(newValue) => {
                  setValue(newValue.map((_opt) => _opt.value))
                }}
              />
            </>
          )
        })()}
      </ComponentCard>

      {/*<ComponentCard label="Combobox" class="w-94">
        <span class="text-xs">Basic (w/ triggerMode focus)</span>
        <ComboboxComp
          placeholder="Select fruit..."
          triggerMode="focus"
          options={[
            { value: "apple", label: "🍎 Apple" },
            { value: "orange", label: "🍊 Orange" },
            { value: "grape", label: "🍇 Grape" },
          ]}
        />
        <span class="text-xs">Multiple w/ sections</span>
        <ComboboxComp
          placeholder="Select fruit..."
          multiple
          options={[
            {
              label: "Citrus",
              options: [
                { value: "lemon", label: "🍋 Lemon" },
                { value: "orange", label: "🍊 Orange" },
                { value: "pineapple", label: "🍍 Pineapple", disabled: true },
              ],
            },
            {
              label: "Berries",
              options: [
                { value: "strawberry", label: "🍓 Strawberry" },
                { value: "blueberry", label: "🫐 Blueberry" },
              ],
            },
          ]}
        />
        {(() => {
          const [value, setValue] = createSignal<string | null>(null)
          const options: ComboboxOption[] = [
            { value: "apple", label: "🍎 Apple" },
            { value: "orange", label: "🍊 Orange" },
            { value: "grape", label: "🍇 Grape" },
          ]
          return (
            <>
              <span class="text-xs">
                Controlled {value() ? `- ${JSON.stringify(value())}` : null}
              </span>
              <ComboboxComp
                placeholder="Select fruit..."
                options={options}
                value={options.find((opt) => opt.value === value())}
                onChange={setValue}
              />
            </>
          )
        })()}
      </ComponentCard>*/}

      <ComponentCard label="Combobox2" class="w-94">
        <span class="text-xs">Basic</span>
        <Combobox2Comp
          placeholder="Select fruit..."
          items={[
            { value: "apple", label: "🍎 Apple" },
            { value: "orange", label: "🍊 Orange" },
            { value: "grape", label: "🍇 Grape" },
          ]}
        />
        <span class="text-xs">Basic small width (it's sameWidth) + disallowEmptySelection</span>
        <Combobox2Comp
          placeholder="Select fruit..."
          triggerClass="w-[200px]"
          disallowEmptySelection
          items={[
            { value: "apple", label: "🍎 Apple" },
            { value: "orange", label: "🍊 Orange" },
            { value: "grape", label: "🍇 Grape" },
          ]}
        />
        <span class="text-xs">Basic multiple</span>
        <Combobox2Comp
          placeholder="Select fruit..."
          multiple
          items={[
            { value: "apple", label: "🍎 Apple" },
            { value: "orange", label: "🍊 Orange" },
            { value: "grape", label: "🍇 Grape" },
          ]}
        />
        <span class="text-xs">Basic jsx</span>
        <Combobox2Comp
          placeholder="Select fruit..."
          multiple
          items={[
            { value: "apple", label: <span class="">🍎 Apple</span> },
            { value: "orange", label: <span class="">🍊 Orange</span> },
            { value: "grape", label: <span class="">🍇 Grape</span> },
          ]}
        />
        {(() => {
          const [value, setValue] = createSignal("")
          const items = [
            { value: "apple", label: "🍎 Apple" },
            { value: "orange", label: "🍊 Orange" },
            { value: "grape", label: "🍇 Grape" },
          ]
          return (
            <>
              <span class="text-xs">
                Controlled {value() ? `- ${JSON.stringify(value())}` : null}
              </span>
              <Combobox2Comp
                placeholder="Select fruit..."
                items={items}
                value={value()}
                onValueChange={setValue}
              />
            </>
          )
        })()}
      </ComponentCard>

      <ComponentCard label="Slider" class="gap-5">
        <SliderComp
          label="Money"
          defaultValue={[25, 75]}
          getValueLabel={(params) => `P${params.values[0]} - P${params.values[1]}`}
        />
        <SliderComp
          label="Percent"
          getValueLabel={(params) => `${params.values}%`}
          thumbTip={(value) => `${value}%`}
        />
      </ComponentCard>
      <ComponentCard label="Badge">
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        {/*<Badge variant="info">Info</Badge>*/}
        <Badge variant="info">Info</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="error">Destructive</Badge>
        <Badge variant="warning">Warning</Badge>
      </ComponentCard>
      <ComponentCard label="Alert">
        <AlertComp
          icon={<div>🦀</div>}
          title="Heads up!"
          description="You can add components to your app using the cli."
        />
        <AlertComp
          variant="destructive"
          title="Heads up!"
          description="You can add components to your app using the cli."
        />
        <AlertComp
          variant="success"
          title="Success!"
          description="Your changes have been saved successfully."
        />
        <AlertComp variant="warning" title="Warning!" description="This action cannot be undone." />
        <AlertComp
          variant="info"
          title="Info"
          description="New updates are available for download."
        />
      </ComponentCard>

      <ComponentCard label="Callout">
        <CalloutComp
          title="Default"
          content="Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tempora cupiditate sapiente officiis ullam, nulla nam sunt? Ipsa facilis ut aspernatur debitis. Qui dolorem modi, assumenda nihil eligendi commodi tempore eos?"
        />
        <CalloutComp
          variant="success"
          title="Success"
          content="Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tempora cupiditate sapiente officiis ullam, nulla nam sunt? Ipsa facilis ut aspernatur debitis. Qui dolorem modi, assumenda nihil eligendi commodi tempore eos?"
        />
        <CalloutComp
          variant="warning"
          title="Warning"
          content="Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tempora cupiditate sapiente officiis ullam, nulla nam sunt? Ipsa facilis ut aspernatur debitis. Qui dolorem modi, assumenda nihil eligendi commodi tempore eos?"
        />
        <CalloutComp
          variant="error"
          title="Error"
          content="Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tempora cupiditate sapiente officiis ullam, nulla nam sunt? Ipsa facilis ut aspernatur debitis. Qui dolorem modi, assumenda nihil eligendi commodi tempore eos?"
        />
      </ComponentCard>

      <ComponentCard label="Breadcrumbs">
        <BreadcrumbComp
          path={[
            { id: "home", label: "Home", href: "/" },
            { id: "ellipsis", isEllipsis: true },
            { id: "components", label: "Components", href: "/components" },
            { id: "breadcrumbs", label: "Breadcrumbs", current: true },
          ]}
        />
      </ComponentCard>
      <ComponentCard label="Toast">
        <Button
          onClick={() => {
            const toasts = [
              () => toast("🍞 Awesome!"),
              () =>
                toast.promise(
                  async () => {
                    const random = Math.floor(Math.random() * 2)

                    if (random === 0) await new Promise((resolve) => setTimeout(resolve, 2000))
                    if (random === 1)
                      await new Promise((_resolve, reject) => setTimeout(reject, 2000))
                  },
                  {
                    loading: "🍞 Cooking your toast...",
                    success: "🍔 Toast cooked!",
                    error: "☄️ Toast failed!",
                  }
                ),
              async () => {
                const toastIdAlphabet = "abcdefghijklmnopqrstuvwxyz1234567890"
                const toastId = [...Array(5)].reduce(
                  (acc, _) =>
                    acc + toastIdAlphabet[Math.floor(Math.random() * toastIdAlphabet.length)],
                  ""
                )
                toast.loading("🔪 Slicing your toast...", { id: toastId })
                await new Promise((resolve) => setTimeout(resolve, 800))
                toast.loading("🤺 Slicing EVEN HARDER!!!", { id: toastId })
                await new Promise((resolve) => setTimeout(resolve, 800))
                toast.loading("💣 It's GONNA BLOW!!!", { id: toastId })
                await new Promise((resolve) => setTimeout(resolve, 500))

                toast.promise(
                  async () => {
                    const random = Math.floor(Math.random() * 2)

                    if (random === 0) await new Promise((resolve) => setTimeout(resolve, 2000))
                    if (random === 1)
                      await new Promise((_resolve, reject) => setTimeout(reject, 2000))
                  },
                  {
                    loading: "👨‍🍳 Cooking EVEN HARDER!!!",
                    success: "🍔 Toast cooked!",
                    error: "☄️ Toast BURNT!",
                    id: toastId,
                  }
                )
              },
            ]

            const random = Math.floor(Math.random() * toasts.length)

            toasts[random]()
          }}
        >
          🎉 Random Toast
        </Button>

        <Button
          onClick={() => {
            toast.success("All changes have been saved!")
          }}
        >
          Success Toast
        </Button>
        <Button
          onClick={() => {
            toast.warning("Your session will expire in 5 minutes.")
          }}
        >
          Warning Toast
        </Button>
        <Button
          onClick={() => {
            toast.info("New feature available in your dashboard.")
          }}
        >
          Info Toast
        </Button>
        <Button
          onClick={() => {
            toast.error("Unable to connect to the server.")
          }}
        >
          Error Toast
        </Button>
      </ComponentCard>
      <ComponentCard label="Tooltip">
        <Tippy content="Content of tooltip">
          <Button variant="outline" as="div">
            Plain
          </Button>
        </Tippy>
        <Tippy
          content={
            <div class="flex flex-col items-center gap-2">
              Content of tooltip
              <img
                alt="content of tooltip"
                src="https://cdn.myanimelist.net/r/200x268/images/characters/16/586614.jpg?s=449698e15fb4c6cdb353d71a267c7d04"
                class="h-10 w-10 rounded-full bg-white object-cover object-center"
              />
            </div>
          }
        >
          <Button variant="outline" as="div">
            With JSX
          </Button>
        </Tippy>
        <Tippy
          content="I am following your cursor"
          props={{
            followCursor: true,
            plugins: [followCursor],
            hideOnClick: false,
          }}
        >
          <Button variant="outline" as="div" class="h-20">
            Follow Cursor
          </Button>
        </Tippy>
        {(() => {
          const [count, setCount] = createSignal(0)
          createEffect(() => {
            setInterval(() => {
              setCount((c) => c + 1)
            }, 1000)
          })
          return (
            <Tippy content={<>Reactive content {count()}</>} props={{ hideOnClick: false }}>
              <Button variant="outline" as="div" onClick={() => setCount((c) => c + 1)}>
                Dont Hide onClick + reactive
              </Button>
            </Tippy>
          )
        })()}
        {(() => {
          const [placement, setPlacement] = useToggle(["top", "bottom", "left", "right"] as const)
          return (
            <Tippy
              content={<>Reactive content {placement()}</>}
              props={{ placement: placement(), hideOnClick: false }}
            >
              <Button variant="outline" as="div" onClick={() => setPlacement()}>
                Placements + reactive
              </Button>
            </Tippy>
          )
        })()}
      </ComponentCard>
      <ComponentCard label="Context Menu">
        <ContextMenuComp
          options={[
            { type: "label", label: "Nice" },
            { type: "separator" },
            {
              type: "item",
              itemId: "2",
              itemDisplay: "Test 1",
              itemTip: "Cmd + 1",
            },
            {
              type: "item",
              itemId: "3",
              itemDisplay: "Test 2",
            },
            {
              type: "sub",
              subTrigger: "Invite users",
              subOptions: [
                {
                  type: "item",
                  itemId: "invite-item-1",
                  itemDisplay: "Email message",
                },
                {
                  type: "item",
                  itemId: "invite-item-2",
                  itemDisplay: "Message via social",
                },
                { type: "separator" },
                {
                  type: "item",
                  itemId: "invite-item-3",
                  itemDisplay: "More...",
                },
              ],
            },
          ]}
        >
          <div class="flex h-32 w-32 items-center justify-center rounded-lg border border-dashed text-xs">
            Right click here
          </div>
        </ContextMenuComp>
      </ComponentCard>
      <ComponentCard label="Popover">
        <PopoverComp
          content={
            <div class="grid gap-4">
              <div class="space-y-2">
                <h4 class="font-medium leading-none">Dimensions</h4>
                <p class="text-muted-foreground text-sm">Set the dimensions for the layer.</p>
              </div>
              <div class="grid gap-2">
                <div class="grid grid-cols-3 items-center gap-4">
                  <label for="width" class="text-sm">
                    Width
                  </label>
                  <input id="width" class="col-span-2 h-8 rounded border px-2 text-sm" />
                </div>
              </div>
            </div>
          }
        >
          <Button as="div">Open</Button>
        </PopoverComp>
      </ComponentCard>
      <_DialogExample />
      <ComponentCard label="Drawer" class="gap-5">
        <span class="text-xs">Simple (w/ automatic accessibility, simple usecases)</span>
        <Drawer>
          <DrawerTrigger class="contents">
            <Button as="span">Open</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Title</DrawerTitle>
              <DrawerDescription>This is a simple drawer example.</DrawerDescription>
            </DrawerHeader>
            <div class="p-4">
              <Button>Submit</Button>
            </div>
          </DrawerContent>
        </Drawer>

        <span class="text-xs">Controlled (manual accessibility, complex usecases)</span>
        {(() => {
          const [drawerOpen, drawerActions] = useDisclosure()

          return (
            <>
              <Button
                onClick={drawerActions.toggle}
                aria-haspopup="dialog"
                aria-expanded={drawerOpen()}
                aria-controls="controlled-drawer"
              >
                Open Controlled Drawer
              </Button>
              <Drawer open={drawerOpen()} onOpenChange={drawerActions.set}>
                <DrawerContent id="controlled-drawer" aria-labelledby="controlled-drawer-title">
                  <DrawerHeader>
                    <DrawerTitle id="controlled-drawer-title">Controlled Drawer Title</DrawerTitle>
                    <DrawerDescription>This is a controlled drawer example.</DrawerDescription>
                  </DrawerHeader>
                  <div class="p-4">
                    <Button onClick={drawerActions.toggle}>Close</Button>
                  </div>
                </DrawerContent>
              </Drawer>
            </>
          )
        })()}

        <span class="text-xs">Directions</span>
        <div class="flex gap-1">
          {(() => {
            const directions = ["bottom", "top", "left", "right"] as const
            const labels = [
              {
                bottom: "Drawer from bottom",
                top: "Drawer from top",
                left: "Drawer from left",
                right: "Drawer from right",
              },
            ]
            return (
              <For each={directions}>
                {(dir) => (
                  <Drawer side={dir}>
                    <DrawerTrigger class="contents">
                      <Button as="span">{labels[0][dir]}</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>{labels[0][dir]}</DrawerTitle>
                        <DrawerDescription>Opening from the {dir} direction.</DrawerDescription>
                      </DrawerHeader>
                      <div class="p-4">
                        <Button>Submit</Button>
                      </div>
                    </DrawerContent>
                  </Drawer>
                )}
              </For>
            )

            //....
          })()}
        </div>
      </ComponentCard>
      <ComponentCard label="Tabs">
        <Tabs defaultValue="account" class="w-[400px]">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <div class="space-y-4 rounded-lg border border-border p-4">
              <h2 class="font-semibold text-lg">Account</h2>
              <p class="text-sm">Make changes to your account here. Click save when you're done.</p>
              <div class="space-y-2">
                <input
                  type="text"
                  placeholder="Full name"
                  class="w-full rounded border px-3 py-2 font-medium text-sm"
                  value="Carlo Taleon"
                />
                <input
                  type="text"
                  placeholder="Username"
                  class="w-full rounded border px-3 py-2 text-muted-foreground text-sm"
                  value="@carlo_taleon"
                />
              </div>
              <Button>Save changes</Button>
            </div>
          </TabsContent>
          <TabsContent value="password">
            <div class="space-y-4 rounded-lg border p-4">
              <h2 class="font-semibold text-lg">Password</h2>
              <p class="text-sm">Change your password here. After saving, you'll be logged out.</p>
              <input
                type="password"
                placeholder="Current password"
                class="w-full rounded border px-3 py-2 text-sm"
              />
              <input
                type="password"
                placeholder="New password"
                class="w-full rounded border px-3 py-2 text-sm"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                class="w-full rounded border px-3 py-2 text-sm"
              />
              <Button>Save password</Button>
            </div>
          </TabsContent>
        </Tabs>
      </ComponentCard>
      <ComponentCard label="Accordion" class="w-[432px]">
        <AccordionComp
          multiple
          items={[
            {
              trigger: "Is it accessible?",
              content: "Yes. It adheres to the WAI-ARIA design pattern.",
            },
            {
              trigger: "Is it styled?",
              content: "Yes. It comes with default styles that matches the other components.",
            },
            {
              trigger: "Is it animated?",
              content: "Yes. It's animated by default, but you can disable it if you prefer.",
            },
          ]}
        />
      </ComponentCard>
      <ComponentCard label="Collapsible" class="w-96">
        <p class="mb-2 text-foreground/50 text-xs">
          Made by Carlo. Kind of like Accordion but for more flexible cases since it can be
          controlled by an external trigger. Also more fluid because of css transitions and never
          dismounts the dom.
        </p>

        {(() => {
          const [open1, actions1] = useDisclosure()
          const [open2, actions2] = useDisclosure()
          const [open3, actions3] = useDisclosure()

          return (
            <div class="contents text-foreground/60">
              <Button onClick={actions1.toggle}>{open1() ? "Close 1" : "Open 1"}</Button>
              <Collapsible open={open1()} class="flex flex-col">
                <span>Collapsible 1</span>
                <span>Collapsible 1</span>
                <span>Collapsible 1</span>
                <span>Collapsible 1</span>
              </Collapsible>

              <Button onClick={actions2.toggle}>{open2() ? "Close 2" : "Open 2"}</Button>
              <Collapsible open={open2()}>Collapsible 2</Collapsible>

              <Button onClick={actions3.toggle}>{open3() ? "Close 3" : "Open 3"}</Button>
              <Collapsible open={open3()}>Collapsible 3</Collapsible>
            </div>
          )
        })()}
      </ComponentCard>
      <ComponentCard label="Checkbox">
        <CheckboxComp
          label="Accept terms and conditions"
          description="You agree to our Terms of Service and Privacy Policy."
        />
      </ComponentCard>
      <ComponentCard label="Radio Group">
        <RadioGroupComp
          options={[
            {
              value: "apple",
              label: "🍎 Apple",
            },
            {
              value: "orange",
              label: "🍊 Orange",
            },
            {
              value: "grape",
              label: "🍇 Grape",
            },
          ]}
        />
      </ComponentCard>
      <ComponentCard label="Date Picker" class="items-center gap-4">
        <span class="text-xs">Basic</span>
        <CalendarComp />

        <span class="text-xs">Basic w/ controls</span>
        <CalendarComp withControls />

        <span class="text-xs">Range</span>
        <CalendarRangeComp />

        <span class="text-xs">Range w/ controls</span>
        <CalendarRangeComp withPicker />
      </ComponentCard>
      <ComponentCard label="Data Table">
        {(() => {
          const data = [
            {
              id: "m5gr84i9",
              status: "success",
              email: "ken99@yahoo.com",
              amount: 316,
            },
            {
              id: "3u1reuv4",
              status: "success",
              email: "Abe45@gmail.com",
              amount: 242,
            },
            {
              id: "derv1ws0",
              status: "processing",
              email: "Monserrat44@gmail.com",
              amount: 837,
            },
            {
              id: "5kma53ae",
              status: "success",
              email: "silas22@gmail.com",
              amount: 874,
            },
            {
              id: "bhqecj4p",
              status: "failed",
              email: "carmella@hotmail.com",
              amount: 721,
            },
            {
              id: "hqkxm3n2",
              status: "failed",
              email: "marlon@outlook.com",
              amount: 143,
            },
            {
              id: "8xvfpq7w",
              status: "processing",
              email: "opal88@hotmail.com",
              amount: 992,
            },
            {
              id: "jkl4mno9",
              status: "success",
              email: "dexter12@gmail.com",
              amount: 654,
            },
            {
              id: "qwe5rty1",
              status: "success",
              email: "luna54@yahoo.com",
              amount: 320,
            },
            {
              id: "zxc6vbn2",
              status: "failed",
              email: "enzo77@gmail.com",
              amount: 467,
            },
            {
              id: "asd7fgh3",
              status: "processing",
              email: "iris23@outlook.com",
              amount: 589,
            },
            {
              id: "mnb8uio4",
              status: "success",
              email: "finn99@hotmail.com",
              amount: 812,
            },
          ]

          const columns: ColumnDef<(typeof data)[number]>[] = [
            {
              id: "select",
              header: (props) => (
                <CheckboxComp
                  checked={props.table.getIsAllPageRowsSelected()}
                  indeterminate={props.table.getIsSomePageRowsSelected()}
                  onChange={(value) => props.table.toggleAllPageRowsSelected(!!value)}
                  aria-label="Select all"
                />
              ),
              cell: (props) => (
                <CheckboxComp
                  checked={props.row.getIsSelected()}
                  onChange={(value) => props.row.toggleSelected(!!value)}
                  aria-label="Select row"
                />
              ),
              enableSorting: false,
              enableHiding: false,
            },
            {
              accessorKey: "status",
              header: "Status",
              cell: (props) => (
                <Badge
                  variant={
                    props.row.getValue("status") === "success"
                      ? "success"
                      : props.row.getValue("status") === "failed"
                        ? "error"
                        : "info"
                  }
                  class="capitalize"
                >
                  {props.row.getValue("status") as string}
                </Badge>
              ),
            },
            {
              accessorKey: "email",
              header: (_props) => <TableColumnHeader column={_props.column} title="Email" />,
            },
            {
              accessorKey: "amount",
              header: (_props) => <TableColumnHeader column={_props.column} title="Amount" />,
              cell: (props) => {
                // eslint-disable-next-line solid/reactivity
                const amount = parseFloat(props.row.getValue("amount"))
                const formatted = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(amount)
                return <div class="text-right font-medium">{formatted}</div>
              },
              filterFn: (row, columnId, filterValue: string) => {
                if (!filterValue.length) return true
                return row.original.amount.toString().includes(filterValue)
              },
            },
          ]

          const statusFilterOptions = [
            { value: "success", label: "Success", checked: true },
            { value: "failed", label: "Failed", checked: false },
            { value: "processing", label: "Processing", checked: false },
          ]

          return (
            <DataTable
              columns={columns}
              data={data}
              toolbar={{
                searchable: {
                  columns: ["email"],
                  placeholder: "Search for email or amount",
                },
                filterables: [
                  {
                    column: "status",
                    title: "Status",
                    options: statusFilterOptions,
                  },
                ],
              }}
            />
          )
        })()}
      </ComponentCard>
      <ComponentCard label="Timeline">
        <Timeline
          items={[
            {
              title: "Event #1",
              description: "This is the first event of the timeline.",
            },
            {
              title: "Event #2",
              description: "This is the second event of the timeline.",
            },
            {
              title: "Event #3",
              description: "This is the third event of the timeline.",
            },
          ]}
          activeItem={1}
        />
      </ComponentCard>

      <ComponentCard label="Pagination">
        {(() => {
          const [currentPage, setCurrentPage] = createSignal(1)

          return (
            <>
              <div class="mb-2">You are now in page: {currentPage()}</div>
              <PaginationComp
                count={10}
                onPageChange={(newPage) => {
                  setCurrentPage(newPage)
                }}
              />
            </>
          )
        })()}
      </ComponentCard>
      <ComponentCard label="Drag and Drop Lists" class="gap-3">
        <span class="max-w-lg text-sm">
          Thoughtfully designed as 1 API, multiple usecases. <br />
          If you have a more complex usecase, read the{" "}
          <code class="rounded bg-foreground p-0.5 text-background">drag-and-drop</code> folder.
          Powered by{" "}
          <a
            href="https://atlassian.design/components/pragmatic-drag-and-drop/"
            class="text-primary"
          >
            pragmatic-dnd
          </a>
          .
        </span>
        <DragExample />
      </ComponentCard>

      <ComponentCard label="Scroll Pagination">
        <ScrollPaginationExample />
      </ComponentCard>
    </div>
  )
}

function ComponentCard(
  props: FlowProps<{
    label?: JSX.Element
    class?: string
  }>
) {
  return (
    <div
      class={cn(
        "flex flex-col gap-1 rounded-lg border border-border p-4 text-card-foreground shadow-sm",
        props.class
      )}
    >
      {props.label && <h3 class="mb-2 font-semibold text-xs">{props.label}</h3>}
      {props.children}
    </div>
  )
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
function _DialogExample() {
  const [dialogOpen, dialogActions] = useDisclosure()

  return (
    <ComponentCard label="Dialog" class="gap-5">
      <span class="text-xs">Simple (w/ automatic accessibility, simple usecases)</span>
      <Dialog>
        <DialogTrigger class="contents">
          <Button as="span">Open</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <Button>Submit</Button>
        </DialogContent>
      </Dialog>

      <span class="text-xs">Controlled (manual accessibility, complex usecases)</span>
      {/*
        Accessibility Documentation:
        - aria-haspopup="dialog": Announces to assistive tech that the button opens a dialog.
        - aria-expanded={dialogOpen()}: Reflects dialog state (true when open, false when closed).
        - aria-controls="controlled-dialog" (recommended): Associate button with dialog;
          requires id="controlled-dialog" on DialogContent to announce which element is controlled.
      */}
      <Button
        onClick={dialogActions.toggle}
        aria-haspopup="dialog"
        aria-expanded={dialogOpen()}
        aria-controls="controlled-dialog"
      >
        Open Controlled Dialog
      </Button>
      <Dialog open={dialogOpen()} onOpenChange={dialogActions.set}>
        <DialogContent id="controlled-dialog" aria-labelledby="controlled-dialog-title">
          <DialogTitle id="controlled-dialog-title">Controlled Dialog Title</DialogTitle>
          <Button onClick={dialogActions.toggle}>Close</Button>
        </DialogContent>
      </Dialog>
    </ComponentCard>
  )
}
