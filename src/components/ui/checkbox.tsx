import type { ValidComponent } from 'solid-js';
import { children, createMemo, Match, Show, splitProps, Switch } from 'solid-js';

import * as CheckboxPrimitive from '@kobalte/core/checkbox';
import type { PolymorphicProps } from '@kobalte/core/polymorphic';

import { cn } from '@/utils/cn';
import { JSX } from 'solid-js/jsx-runtime';
import { Label } from './label';

type CheckboxRootProps<T extends ValidComponent = 'div'> =
  CheckboxPrimitive.CheckboxRootProps<T> & { class?: string | undefined };

const Checkbox = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, CheckboxRootProps<T>>
) => {
  const [local, others] = splitProps(props as CheckboxRootProps, ['class']);

  return (
    <CheckboxPrimitive.Root
      class={cn('items-top group relative flex space-x-2', local.class)}
      {...others}
    >
      <CheckboxPrimitive.Input class="peer" />
      <CheckboxPrimitive.Control class="data-checked:border-primary ring-offset-background peer-focus-visible:ring-ring data-[checked]:bg-primary data-[indeterminate]:bg-primary data-[checked]:text-primary-foreground data-[indeterminate]:text-primary-foreground size-4 shrink-0 rounded-sm border peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-none data-[indeterminate]:border-none">
        <CheckboxPrimitive.Indicator>
          <Switch>
            <Match when={!others.indeterminate}>
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
            </Match>
            <Match when={others.indeterminate}>
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
                <path d="M5 12l14 0" />
              </svg>
            </Match>
          </Switch>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Control>
    </CheckboxPrimitive.Root>
  );
};

export { Checkbox };

// ---

type CheckboxCompProps<T extends ValidComponent = 'div'> = {
  label?: JSX.Element;
  description?: JSX.Element;
  id?: string;
  labelProps?: JSX.HTMLAttributes<HTMLLabelElement>;
  descriptionProps?: JSX.HTMLAttributes<HTMLParagraphElement>;
} & Omit<CheckboxRootProps<T>, 'id'>;

export const CheckboxComp = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, CheckboxCompProps<T>>
) => {
  const [local, others] = splitProps(props as CheckboxCompProps<T>, [
    'label',
    'description',
    'id',
    'labelProps',
    'descriptionProps',
  ]);
  const id = createMemo(() => local.id || `checkbox-${Math.random().toString(36).slice(2)}`);

  const label = children(() => local.label);

  return (
    <div class="flex items-start space-x-2">
      {/* @ts-expect-error This is fine :) */}
      <Checkbox id={id()} {...others} />
      <div class="grid gap-1.5 leading-none">
        <Show when={label()}>
          {(_label) => (
            <Label
              for={`${id()}-input`}
              class="text-sm leading-4 font-medium"
              {...local.labelProps}
            >
              {_label()}
            </Label>
          )}
        </Show>
        {local.description && (
          <p class="text-muted-foreground text-sm" {...local.descriptionProps}>
            {local.description}
          </p>
        )}
      </div>
    </div>
  );
};
