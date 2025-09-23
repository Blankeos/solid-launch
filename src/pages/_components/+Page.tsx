import { AccordionComp } from '@/components/ui/accordion';
import { AlertComp } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { BreadcrumbComp } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { CheckboxComp } from '@/components/ui/checkbox';
import { Collapsible } from '@/components/ui/collapsible';
import { ContextMenuComp } from '@/components/ui/context-menu';
import { DialogComp } from '@/components/ui/dialog';
import { DropdownMenuComp } from '@/components/ui/dropdown-menu';
import { SelectComp, SelectOption } from '@/components/ui/select';
import { SwitchComp } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useThemeContext } from '@/contexts/theme.context';
import { Tippy } from '@/lib/solid-tippy';
import { cn } from '@/utils/cn';
import { useDisclosure, useToggle } from 'bagon-hooks';
import { createEffect, createSignal, FlowProps } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';
import { toast } from 'solid-sonner';
import { followCursor } from 'tippy.js';

export default function ComponentsPage() {
  return (
    <div class="flex flex-wrap gap-4 p-4">
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
            {
              itemId: 'commit',
              itemDisplay: 'Commit',
              itemTip: '⌘+K',
            },
            {
              itemId: 'push',
              itemDisplay: 'Push',
              itemTip: '⇧+⌘+K',
            },
            {
              itemId: 'update',
              itemDisplay: 'Update Project',
              itemTip: '⌘+T',
            },
            {
              subTrigger: 'GitHub',
              subOptions: [
                {
                  itemId: 'create-pr',
                  itemDisplay: 'Create Pull Request…',
                },
                {
                  itemId: 'view-pr',
                  itemDisplay: 'View Pull Requests',
                },
                {
                  itemId: 'sync-fork',
                  itemDisplay: 'Sync Fork',
                },
                { separator: true },
                {
                  itemId: 'open-github',
                  itemDisplay: 'Open on GitHub',
                },
              ],
            },
            { separator: true },
          ]}
        >
          <Button as="div">Open options</Button>
        </DropdownMenuComp>
      </ComponentCard>

      <ComponentCard label="Switch" class="gap-y-5">
        <SwitchComp label="Enable" />
        {(() => {
          const { theme, toggleTheme } = useThemeContext();

          return <SwitchComp label={theme() === 'light' ? '☀️' : '🌜'} onChange={toggleTheme} />;
        })()}
      </ComponentCard>

      <ComponentCard label="Select" class="w-96">
        <span class="text-xs">Basic</span>
        <SelectComp
          options={[
            { value: 'apple', label: '🍎 Apple' },
            { value: 'orange', label: '🍊 Orange' },
            { value: 'grape', label: '🍇 Grape' },
          ]}
        />
        <span class="text-xs">Multiple</span>
        <SelectComp
          multiple
          options={[
            { value: 'apple', label: '🍎 Apple' },
            { value: 'orange', label: '🍊 Orange' },
            { value: 'grape', label: '🍇 Grape' },
          ]}
        />
        <SelectComp loading options={[]} placeholder="Loading" />
        <SelectComp disabled options={[]} placeholder="Disabled" />
        <span class="text-xs">Basic (Controlled)</span>
        {(() => {
          const [value, setValue] = createSignal<string | null>('apple');
          const options: SelectOption[] = [
            { value: 'apple', label: '🍎 Apple' },
            { value: 'orange', label: '🍊 Orange' },
            { value: 'grape', label: '🍇 Grape' },
          ];

          return (
            <SelectComp
              options={options}
              value={options.find((_opt) => _opt.value === value())}
              onChange={(newValue) => {
                setValue(newValue?.value ?? null);
              }}
            />
          );
        })()}
        <span class="text-xs">Multiple (Controlled)</span>
        {(() => {
          const [value, setValue] = createSignal(['apple', 'orange']);
          const options: SelectOption[] = [
            { value: 'apple', label: '🍎 Apple' },
            { value: 'orange', label: '🍊 Orange' },
            { value: 'grape', label: '🍇 Grape' },
          ];

          return (
            <SelectComp
              multiple
              options={options}
              value={options.filter((_opt) => value().includes(_opt.value))}
              onChange={(newValue) => {
                setValue(newValue.map((_opt) => _opt.value));
              }}
            />
          );
        })()}
      </ComponentCard>

      <ComponentCard label="Badge">
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        {/*<Badge variant="info">Info</Badge>*/}
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
      </ComponentCard>

      <ComponentCard label="Breadcrumbs">
        <BreadcrumbComp
          path={[
            { id: 'home', label: 'Home', href: '/' },
            { id: 'ellipsis', isEllipsis: true },
            { id: 'components', label: 'Components', href: '/components' },
            { id: 'breadcrumbs', label: 'Breadcrumbs', current: true },
          ]}
        />
      </ComponentCard>
      <ComponentCard label="Toast">
        <Button
          onClick={() => {
            const toasts = [
              () => toast('🍞 Awesome!'),
              () =>
                toast.promise(
                  async () => {
                    const random = Math.floor(Math.random() * 2);

                    if (random === 0) await new Promise((resolve) => setTimeout(resolve, 2000));
                    if (random === 1)
                      await new Promise((resolve, reject) => setTimeout(reject, 2000));
                  },
                  {
                    loading: '🍞 Cooking your toast...',
                    success: '🍔 Toast cooked!',
                    error: '☄️ Toast failed!',
                  }
                ),
              async () => {
                const toastIdAlphabet = 'abcdefghijklmnopqrstuvwxyz1234567890';
                const toastId = [...Array(5)].reduce(
                  (acc, _) =>
                    acc + toastIdAlphabet[Math.floor(Math.random() * toastIdAlphabet.length)],
                  ''
                );
                toast.loading('🔪 Slicing your toast...', { id: toastId });
                await new Promise((resolve) => setTimeout(resolve, 800));
                toast.loading('🤺 Slicing EVEN HARDER!!!', { id: toastId });
                await new Promise((resolve) => setTimeout(resolve, 800));
                toast.loading("💣 It's GONNA BLOW!!!", { id: toastId });
                await new Promise((resolve) => setTimeout(resolve, 500));

                toast.promise(
                  async () => {
                    const random = Math.floor(Math.random() * 2);

                    if (random === 0) await new Promise((resolve) => setTimeout(resolve, 2000));
                    if (random === 1)
                      await new Promise((resolve, reject) => setTimeout(reject, 2000));
                  },
                  {
                    loading: '👨‍🍳 Cooking EVEN HARDER!!!',
                    success: '🍔 Toast cooked!',
                    error: '☄️ Toast BURNT!',
                    id: toastId,
                  }
                );
              },
            ];

            const random = Math.floor(Math.random() * toasts.length);

            toasts[random]();
          }}
        >
          Show a Toast
        </Button>
      </ComponentCard>

      {/*<ComponentCard label="Tooltip">
        <TooltipComp content="Content of tooltip" triggerProps={{ class: 'w-max self-center' }}>
          <Button variant="outline" as="div">
            Hover
          </Button>
        </TooltipComp>
        <TooltipComp
          content="Content of tooltip + following 🦋!"
          followCursor
          contentProps={{ class: 'pointer-events-none' }}
        >
          <Button variant="outline" as="div" class="h-52 w-52">
            Hover with Follow
          </Button>
        </TooltipComp>
        <TooltipComp
          content="Content of tooltip + following 🦋!"
          followCursor="horizontal"
          contentProps={{ class: 'pointer-events-none' }}
        >
          <Button variant="outline" as="div" class="h-52 w-52">
            Hover with Follow
          </Button>
        </TooltipComp>
        <TooltipComp
          content="Content of tooltip + following 🦋!"
          followCursor="vertical"
          contentProps={{ class: 'pointer-events-none' }}
        >
          <Button variant="outline" as="div" class="h-52 w-52">
            Hover with Follow
          </Button>
        </TooltipComp>
      </ComponentCard>*/}
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
          props={{ followCursor: true, plugins: [followCursor] }}
        >
          <Button variant="outline" as="div" class="h-20">
            Follow Cursor
          </Button>
        </Tippy>
        {(() => {
          const [count, setCount] = createSignal(0);
          createEffect(() => {
            setInterval(() => {
              setCount((c) => c + 1);
            }, 1000);
          });
          return (
            <Tippy content={<>Reactive content {count()}</>} props={{ hideOnClick: false }}>
              <Button variant="outline" as="div" onClick={() => setCount((c) => c + 1)}>
                Dont Hide onClick + reactive
              </Button>
            </Tippy>
          );
        })()}
        {(() => {
          const [placement, setPlacement] = useToggle(['top', 'bottom', 'left', 'right'] as const);
          return (
            <Tippy
              content={<>Reactive content {placement()}</>}
              props={{ placement: placement(), hideOnClick: false }}
            >
              <Button variant="outline" as="div" onClick={() => setPlacement()}>
                Placements + reactive
              </Button>
            </Tippy>
          );
        })()}
      </ComponentCard>
      <ComponentCard label="Context Menu">
        <ContextMenuComp
          options={[
            { label: 'Nice' },
            { separator: true },
            {
              itemId: '2',
              itemDisplay: 'Test 1',
              itemTip: 'Cmd + 1',
            },
            {
              itemId: '3',
              itemDisplay: 'Test 2',
            },
            {
              subTrigger: 'Invite users',
              subOptions: [
                {
                  itemId: 'invite-item-1',
                  itemDisplay: 'Email message',
                },
                {
                  itemId: 'invite-item-2',
                  itemDisplay: 'Message via social',
                },
                { separator: true },
                {
                  itemId: 'invite-item-3',
                  itemDisplay: 'More...',
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
        <Button>Open</Button>
      </ComponentCard>

      <_DialogExample />

      <ComponentCard label="Sheet">
        <Button>Open</Button>
      </ComponentCard>

      <ComponentCard label="Drawer">
        <Button>Open</Button>
      </ComponentCard>

      <ComponentCard label="Tabs">
        <Tabs defaultValue="account" class="w-[400px]">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <div class="border-border space-y-4 rounded-lg border p-4">
              <h2 class="text-lg font-semibold">Account</h2>
              <p class="text-sm">Make changes to your account here. Click save when you're done.</p>
              <div class="space-y-2">
                <input
                  type="text"
                  placeholder="Full name"
                  class="w-full rounded border px-3 py-2 text-sm font-medium"
                  value="Pedro Duarte"
                />
                <input
                  type="text"
                  placeholder="Username"
                  class="text-muted-foreground w-full rounded border px-3 py-2 text-sm"
                  value="@peduarte"
                />
              </div>
              <Button>Save changes</Button>
            </div>
          </TabsContent>
          <TabsContent value="password">
            <div class="space-y-4 rounded-lg border p-4">
              <h2 class="text-lg font-semibold">Password</h2>
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
              trigger: 'Is it accessible?',
              content: 'Yes. It adheres to the WAI-ARIA design pattern.',
            },
            {
              trigger: 'Is it styled?',
              content: 'Yes. It comes with default styles that matches the other components.',
            },
            {
              trigger: 'Is it animated?',
              content: "Yes. It's animated by default, but you can disable it if you prefer.",
            },
          ]}
        />
      </ComponentCard>

      <ComponentCard label="Collapsible" class="w-96">
        <p class="text-foreground/50 mb-2 text-xs">
          Made by Carlo. Kind of like Accordion but for more flexible cases since it can be
          controlled by an external trigger. Also more fluid because of css transitions and never
          dismounts the dom.
        </p>

        {(() => {
          const [open1, actions1] = useDisclosure();
          const [open2, actions2] = useDisclosure();
          const [open3, actions3] = useDisclosure();

          return (
            <div class="text-foreground/60 contents">
              <Button onClick={actions1.toggle}>{open1() ? 'Close 1' : 'Open 1'}</Button>
              <Collapsible open={open1()} class="flex flex-col">
                <span>Collapsible 1</span>
                <span>Collapsible 1</span>
                <span>Collapsible 1</span>
                <span>Collapsible 1</span>
              </Collapsible>

              <Button onClick={actions2.toggle}>{open2() ? 'Close 2' : 'Open 2'}</Button>
              <Collapsible open={open2()}>Collapsible 2</Collapsible>

              <Button onClick={actions3.toggle}>{open3() ? 'Close 3' : 'Open 3'}</Button>
              <Collapsible open={open3()}>Collapsible 3</Collapsible>
            </div>
          );
        })()}
      </ComponentCard>

      <ComponentCard label="Checkbox">
        <CheckboxComp
          label="Accept terms and conditions"
          description="You agree to our Terms of Service and Privacy Policy."
        />
      </ComponentCard>
      <ComponentCard label="Radio Group">1</ComponentCard>

      <ComponentCard label="Calendar">1</ComponentCard>
      <ComponentCard label="Data Table">1</ComponentCard>
      <ComponentCard label="Timeline">1</ComponentCard>
    </div>
  );
}

export function ComponentCard(
  props: FlowProps<{
    label?: JSX.Element;
    class?: string;
  }>
) {
  return (
    <div
      class={cn(
        'text-card-foreground border-border flex flex-col gap-1 rounded-lg border p-4 shadow-sm',
        props.class
      )}
    >
      {props.label && <h3 class="mb-2 text-xs font-semibold">{props.label}</h3>}
      {props.children}
    </div>
  );
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
function _DialogExample() {
  const [dialogOpen, dialogActions] = useDisclosure();
  return (
    <ComponentCard label="Dialog">
      <Button onClick={dialogActions.toggle}>Open</Button>
      <DialogComp open={dialogOpen()} onOpenChange={dialogActions.set}>
        <Button>Carlo</Button>
      </DialogComp>
    </ComponentCard>
  );
}
