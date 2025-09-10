import { AlertComp } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { BreadcrumbComp } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { DialogComp } from '@/components/ui/dialog';
import { DropdownMenuComp } from '@/components/ui/dropdown-menu';
import { SelectComp } from '@/components/ui/select';
import { SwitchComp } from '@/components/ui/switch';
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
        <Button variant="secondary">Second</Button>
        <Button variant="destructive">Destruct</Button>
        <Button variant="ghost">Ghost</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Loading...</Button>
      </ComponentCard>

      <ComponentCard label="Dropdown">
        <DropdownMenuComp
          options={[
            {
              label: 'Label',
            },
            {
              itemId: 'item-1',
              itemDisplay: 'Item 1',
            },
            {
              itemId: 'item-2',
              itemDisplay: 'Item 2',
            },
          ]}
        >
          <Button as="div">Open Options</Button>
        </DropdownMenuComp>
      </ComponentCard>

      <ComponentCard label="Switch">
        <SwitchComp label="Carlo" />
      </ComponentCard>

      <ComponentCard label="Select">
        <SelectComp
          options={[
            { value: 'apple', label: 'Apple' },
            { value: 'orange', label: 'Orange' },
            { value: 'grape', label: 'Grape' },
          ]}
        />
        <SelectComp loading options={[]} />
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
              <div class="h-10 w-10 rounded-full bg-white" />
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
      <ComponentCard label="Popover">1</ComponentCard>

      <ComponentCard label="Sheet">1</ComponentCard>
      <_DialogExample />
      <ComponentCard label="Drawer">1</ComponentCard>

      <ComponentCard label="Tabs">1</ComponentCard>
      <ComponentCard label="Accordion">1</ComponentCard>

      <ComponentCard label="Checkbox">1</ComponentCard>
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
        'bg-card text-card-foreground flex flex-col gap-1 rounded-lg border p-4 shadow-sm',
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
