// NOT A SOLID-UI / SHADCN COMPONENT. CUSTOM BY CARLO
// A11Y NOTES ----------------------------------------------------
// - The extra divs here (outer animating wrapper + inner measure div)
//   are **not** exposed to the a11y tree because:
//     – we don't add any semantic roles
//     – we don't add any labelling attributes
//   So screen-readers will only “see” the real interactive controls
//   that compose this component (buttons, links, inputs, etc.).
//   Multiple layout divs are therefore “noise-free”.
// - The collapsing action itself should be announced by whatever
//   trigger toggles the `open` prop (e.g. the parent button should
//   have `aria-expanded` and `aria-controls`).
// - If this component is ever used as a disclosure region directly,
//   add `id`, `role="region"` and `aria-labelledby` (or `aria-label`)
//   on the outer div so assistive tech can associate it with the
//   controlling button.
// - `overflow:hidden` on the outer div prevents keyboard focus from
//   landing on off-screen descendants when closed, but double-check
//   that no forced-focus logic circumvents that.
// - Prefer `prefers-reduced-motion` in consumer code to disable
//   the `transition-all` class when the user has requested it.
// - HIDING CONTENT FROM SR WHEN CLOSED:  Yes, this is the usual,
//   expected pattern.  When a disclosure widget is closed we remove
//   its descendants from the a11y tree with `aria-hidden` so users
//   cannot read/traverse it.  (aria-expanded=false already implies
//   invisibility for SR users; aria-hidden just makes it official.)
//   When open we drop aria-hidden so the region is discoverable again.
// ---------------------------------------------------------------

import { cn } from '@/utils/cn';
import { type JSX, children, createSignal, onCleanup, onMount, splitProps } from 'solid-js';

export interface CollapsibleProps extends JSX.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  /**
   * Applied to the collapsing wrapper div (the element whose height changes). Generally no need to touch this besides changing the transition duration.
   */
  containerClass?: string;
  /**
   * Applied to the content div (the measured inner wrapper)
   */
  class?: string;
  children: JSX.Element;
}

/*
 * Fluid height collapsible built on native resize events.
 * Uses transition-* utilities (duration/ease) – the root parent gets
 * a changing style.height that the utility class animates.
 * Works exactly like an Accordion panel but without any trigger
 * baggage; state is 100% parent-controlled via open={bool}.
 */
export function Collapsible(props: CollapsibleProps) {
  let innerRef: HTMLDivElement | undefined;
  let lastHeight = 0;

  const [local, others] = splitProps(props, ['open', 'containerClass', 'class', 'children']);
  const [height, setHeight] = createSignal<number | string>('auto');

  // Observe the *inner* element’s size so any content change is reflected
  const resizeHandler = () => {
    if (innerRef) {
      lastHeight = innerRef.scrollHeight;
      setHeight(lastHeight); // keep latest value when open
    }
  };

  let ro: ResizeObserver;
  onMount(() => {
    if (!innerRef) return;
    ro = new ResizeObserver(resizeHandler);
    ro.observe(innerRef);
    resizeHandler(); // ensure initial read
  });

  onCleanup(() => ro?.disconnect());

  // Select what to render based on open state
  // (invoke children here once so ResizeObserver sees static children of inner)
  const content = children(() => local.children);

  const heightStyle = () => (local.open ? `${height()}px` : '0px');
  return (
    <div
      style={{ height: heightStyle() }}
      class={cn(local.containerClass, 'overflow-hidden transition-[width,height] duration-400')}
      aria-hidden={!local.open}
      {...others}
    >
      {/* inner wrapper we measure */}
      <div ref={innerRef} class={cn(local.class, 'w-full')}>
        {content()}
      </div>
    </div>
  );
}
