import type { Component, ComponentProps } from 'solid-js';
import { splitProps } from 'solid-js';

import { cn } from '@/utils/cn';

const Label: Component<ComponentProps<'label'>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return (
    <label
      class={cn(
        'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        local.class
      )}
      {...others}
    />
  );
};

export { Label };
