import type { Component, ComponentProps, ValidComponent } from 'solid-js';
import { Show, splitProps } from 'solid-js';

import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import * as PopoverPrimitive from '@kobalte/core/popover';

import { cn } from '@/utils/cn';
import { JSX } from 'solid-js/jsx-runtime';

const PopoverTrigger = PopoverPrimitive.Trigger;

const Popover: Component<PopoverPrimitive.PopoverRootProps> = (props) => {
  return <PopoverPrimitive.Root gutter={4} {...props} />;
};

type PopoverContentProps<T extends ValidComponent = 'div'> =
  PopoverPrimitive.PopoverContentProps<T> & { class?: string | undefined };

const PopoverContent = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, PopoverContentProps<T>>
) => {
  const [local, others] = splitProps(props as PopoverContentProps, ['class']);
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        class={cn(
          'bg-popover text-popover-foreground data-[expanded]:animate-flyUpAndScale data-[closed]:animate-flyUpAndScaleExit z-50 w-72 origin-[var(--kb-popover-content-transform-origin)] rounded-md border p-4 shadow-md outline-none',
          local.class
        )}
        {...others}
      />
    </PopoverPrimitive.Portal>
  );
};

export { Popover, PopoverContent, PopoverTrigger };

// ---

export const PopoverComp: Component<
  ComponentProps<typeof Popover> & {
    content?: JSX.Element;
    contentProps?: ComponentProps<typeof PopoverContent>;
    children: JSX.Element;
    arrow?: boolean;
  }
> = (props) => {
  const [local, rest] = splitProps(props, ['children', 'content', 'contentProps', 'arrow']);
  return (
    <Popover {...rest}>
      <PopoverTrigger>{local.children}</PopoverTrigger>
      <PopoverContent {...local.contentProps}>
        <Show when={local.arrow === true}>
          <PopoverPrimitive.Arrow />
        </Show>
        {local.content}
      </PopoverContent>
    </Popover>
  );
};
