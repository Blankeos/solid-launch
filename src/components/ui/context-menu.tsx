import type { Component, ComponentProps, JSX, ValidComponent } from 'solid-js';
import { For, splitProps } from 'solid-js';

import * as ContextMenuPrimitive from '@kobalte/core/context-menu';
import type { PolymorphicProps } from '@kobalte/core/polymorphic';

import { cn } from '@/utils/cn';

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
const ContextMenuPortal = ContextMenuPrimitive.Portal;
const ContextMenuSub = ContextMenuPrimitive.Sub;
const ContextMenuGroup = ContextMenuPrimitive.Group;
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenu: Component<ContextMenuPrimitive.ContextMenuRootProps> = (props) => {
  return <ContextMenuPrimitive.Root gutter={4} {...props} />;
};

type ContextMenuContentProps<T extends ValidComponent = 'div'> =
  ContextMenuPrimitive.ContextMenuContentProps<T> & {
    class?: string | undefined;
  };

const ContextMenuContent = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, ContextMenuContentProps<T>>
) => {
  const [local, others] = splitProps(props as ContextMenuContentProps, ['class']);
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        class={cn(
          'bg-popover text-popover-foreground animate-in z-50 min-w-32 origin-[var(--kb-menu-content-transform-origin)] overflow-hidden rounded-md border p-1 shadow-md',
          local.class
        )}
        {...others}
      />
    </ContextMenuPrimitive.Portal>
  );
};

type ContextMenuItemProps<T extends ValidComponent = 'div'> =
  ContextMenuPrimitive.ContextMenuItemProps<T> & {
    class?: string | undefined;
  };

const ContextMenuItem = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, ContextMenuItemProps<T>>
) => {
  const [local, others] = splitProps(props as ContextMenuItemProps, ['class']);
  return (
    <ContextMenuPrimitive.Item
      class={cn(
        'focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        local.class
      )}
      {...others}
    />
  );
};

const ContextMenuShortcut: Component<ComponentProps<'span'>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return <span class={cn('ml-auto text-xs tracking-widest opacity-60', local.class)} {...others} />;
};

type ContextMenuSeparatorProps<T extends ValidComponent = 'hr'> =
  ContextMenuPrimitive.ContextMenuSeparatorProps<T> & {
    class?: string | undefined;
  };

const ContextMenuSeparator = <T extends ValidComponent = 'hr'>(
  props: PolymorphicProps<T, ContextMenuSeparatorProps<T>>
) => {
  const [local, others] = splitProps(props as ContextMenuSeparatorProps, ['class']);
  return (
    <ContextMenuPrimitive.Separator
      class={cn('bg-muted -mx-1 my-1 h-px', local.class)}
      {...others}
    />
  );
};

type ContextMenuSubTriggerProps<T extends ValidComponent = 'div'> =
  ContextMenuPrimitive.ContextMenuSubTriggerProps<T> & {
    class?: string | undefined;
    children?: JSX.Element;
  };

const ContextMenuSubTrigger = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, ContextMenuSubTriggerProps<T>>
) => {
  const [local, others] = splitProps(props as ContextMenuSubTriggerProps, ['class', 'children']);
  return (
    <ContextMenuPrimitive.SubTrigger
      class={cn(
        'focus:bg-accent data-[state=open]:bg-accent flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none',
        local.class
      )}
      {...others}
    >
      {local.children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="ml-auto size-4"
      >
        <path d="M9 6l6 6l-6 6" />
      </svg>
    </ContextMenuPrimitive.SubTrigger>
  );
};

type ContextMenuSubContentProps<T extends ValidComponent = 'div'> =
  ContextMenuPrimitive.ContextMenuSubContentProps<T> & {
    class?: string | undefined;
  };

const ContextMenuSubContent = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, ContextMenuSubContentProps<T>>
) => {
  const [local, others] = splitProps(props as ContextMenuSubContentProps, ['class']);
  return (
    <ContextMenuPrimitive.SubContent
      class={cn(
        'bg-popover text-popover-foreground animate-in z-50 min-w-32 origin-[var(--kb-menu-content-transform-origin)] overflow-hidden rounded-md border p-1 shadow-md',
        local.class
      )}
      {...others}
    />
  );
};

type ContextMenuCheckboxItemProps<T extends ValidComponent = 'div'> =
  ContextMenuPrimitive.ContextMenuCheckboxItemProps<T> & {
    class?: string | undefined;
    children?: JSX.Element;
  };

const ContextMenuCheckboxItem = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, ContextMenuCheckboxItemProps<T>>
) => {
  const [local, others] = splitProps(props as ContextMenuCheckboxItemProps, ['class', 'children']);
  return (
    <ContextMenuPrimitive.CheckboxItem
      class={cn(
        'focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        local.class
      )}
      {...others}
    >
      <span class="absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-4"
          >
            <path d="M5 12l5 5l10 -10" />
          </svg>
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {local.children}
    </ContextMenuPrimitive.CheckboxItem>
  );
};

type ContextMenuGroupLabelProps<T extends ValidComponent = 'span'> =
  ContextMenuPrimitive.ContextMenuGroupLabelProps<T> & {
    class?: string | undefined;
  };

const ContextMenuGroupLabel = <T extends ValidComponent = 'span'>(
  props: PolymorphicProps<T, ContextMenuGroupLabelProps<T>>
) => {
  const [local, others] = splitProps(props as ContextMenuGroupLabelProps, ['class']);
  return (
    <ContextMenuPrimitive.GroupLabel
      class={cn('px-2 py-1.5 text-sm font-semibold', local.class)}
      {...others}
    />
  );
};

type ContextMenuRadioItemProps<T extends ValidComponent = 'div'> =
  ContextMenuPrimitive.ContextMenuRadioItemProps<T> & {
    class?: string | undefined;
    children?: JSX.Element;
  };

const ContextMenuRadioItem = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, ContextMenuRadioItemProps<T>>
) => {
  const [local, others] = splitProps(props as ContextMenuRadioItemProps, ['class', 'children']);
  return (
    <ContextMenuPrimitive.RadioItem
      class={cn(
        'focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        local.class
      )}
      {...others}
    >
      <span class="absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-2 fill-current"
          >
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          </svg>
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {local.children}
    </ContextMenuPrimitive.RadioItem>
  );
};

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};

// ---

type ContextMenuOptionItem = {
  itemId: string;
  itemDisplay?: JSX.Element;
  itemOnSelect?: (id: string) => void;
  itemTip?: JSX.Element;
  hide?: boolean;
};

type ContextMenuOptionSeparator = { separator: true };

type ContextMenuOptionLabel = { label: JSX.Element };

export const ContextMenuComp: Component<
  ComponentProps<typeof ContextMenu> & {
    options: (ContextMenuOptionItem | ContextMenuOptionSeparator | ContextMenuOptionLabel)[];
  }
> = (props) => {
  return (
    <ContextMenu {...props}>
      <ContextMenuTrigger>{props.children}</ContextMenuTrigger>
      <ContextMenuContent>
        <For each={props.options}>
          {(option) => {
            if ('separator' in option && option.separator === true) {
              return <ContextMenuSeparator />;
            } else if ('label' in option) {
              return <ContextMenuGroupLabel>{option.label}</ContextMenuGroupLabel>;
            } else {
              const item = option as ContextMenuOptionItem;
              if (item.hide) return null;
              return (
                <ContextMenuItem onSelect={() => item.itemOnSelect?.(item.itemId)}>
                  {item.itemDisplay}
                  {item.itemTip && <ContextMenuShortcut>{item.itemTip}</ContextMenuShortcut>}
                </ContextMenuItem>
              );
            }
          }}
        </For>
      </ContextMenuContent>
    </ContextMenu>
  );
};
