/** eslint-disable solid/reactivity */
import {
  children,
  createComputed,
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  splitProps,
  untrack,
} from "solid-js"
import makeTippy, { type Instance, type Props } from "tippy.js"
import makeHeadlessTippy from "tippy.js/headless"

export interface TippyOptions {
  disabled?: boolean
  hidden?: boolean
  props?: Partial<Props>
}

export function tippy<T extends Element>(target: T, opts: () => TippyOptions | undefined): void {
  createEffect(() => {
    const options = opts()
    const instance = makeTippy(
      target,
      untrack(() => options?.props)
    )

    createComputed(() => {
      if (options?.disabled) {
        instance.disable()
      } else {
        instance.enable()
      }
    })

    createComputed(() => {
      if (options?.hidden) {
        instance.hide()
      } else {
        instance.show()
      }
    })

    createComputed(() => {
      instance.setProps({
        ...(options?.props ?? {}),
      })
    })

    onCleanup(() => {
      instance.destroy()
    })
  })
}

export function tippyHeadless<T extends Element>(
  target: T,
  opts: () => TippyOptions | undefined
): void {
  createEffect(() => {
    const options = opts()
    const instance = makeHeadlessTippy(
      target,
      untrack(() => options?.props)
    )

    createComputed(() => {
      if (options?.disabled) {
        instance.disable()
      } else {
        instance.enable()
      }
    })

    createComputed(() => {
      if (options?.hidden) {
        instance.hide()
      } else {
        instance.show()
      }
    })

    createComputed(() => {
      instance.setProps({
        ...(options?.props ?? {}),
      })
    })

    onCleanup(() => {
      instance.destroy()
    })
  })
}

export function useTippy<T extends Element>(
  target: () => T | undefined | null,
  options?: TippyOptions
): () => Instance | undefined {
  const [current, setCurrent] = createSignal<Instance>()

  createEffect(() => {
    const currentTarget = target()
    if (currentTarget) {
      const instance = makeTippy(
        currentTarget,
        untrack(() => options?.props)
      )

      setCurrent(instance)

      createComputed(() => {
        if (options?.disabled) {
          instance.disable()
        } else {
          instance.enable()
        }
      })

      createComputed(() => {
        if (options?.hidden) {
          instance.hide()
        } else {
          instance.show()
        }
      })

      createComputed(() => {
        instance.setProps({
          ...(options?.props ?? {}),
        })
      })

      onCleanup(() => {
        instance.destroy()
      })
    }
  })

  // eslint-disable-next-line solid/reactivity
  return () => current()
}

export function useTippyHeadless<T extends Element>(
  target: () => T | undefined | null,
  options?: TippyOptions
): () => Instance | undefined {
  const [current, setCurrent] = createSignal<Instance>()

  createEffect(() => {
    const currentTarget = target()
    if (currentTarget) {
      const instance = makeHeadlessTippy(
        currentTarget,
        untrack(() => options?.props)
      )

      setCurrent(instance)

      createComputed(() => {
        if (options?.disabled) {
          instance.disable()
        } else {
          instance.enable()
        }
      })

      createComputed(() => {
        if (options?.hidden) {
          instance.hide()
        } else {
          instance.show()
        }
      })

      createComputed(() => {
        instance.setProps({
          ...(options?.props ?? {}),
        })
      })

      onCleanup(() => {
        instance.destroy()
      })
    }
  })

  // eslint-disable-next-line solid/reactivity
  return () => current()
}

type CustomTippyOptions = {
  disabled?: boolean
  hidden?: boolean
  open?: boolean
  content?: string | JSX.Element
  props?: Omit<Partial<Props>, "content">
}

export function Tippy(props: CustomTippyOptions & { children: JSX.Element }) {
  // Separate component-specific props from those passed to Tippy.js.
  const [local, tippyProps] = splitProps(props, ["children", "content", "open"])

  const resolvedChildren = children(() => local.children)
  const [trigger, setTrigger] = createSignal<HTMLElement>()

  createEffect(() => {
    // Tippy is attached to the first DOM element found in the children.
    const child = resolvedChildren.toArray()[0]
    if (child instanceof HTMLElement) {
      setTrigger(child)
    }
  })

  // Create a signal to hold the DOM element for the tooltip content.
  const [contentContainer, setContentContainer] = createSignal<HTMLDivElement>()

  useTippy(trigger, {
    // Pass reactive getters for Tippy options to `useTippy`.
    // This ensures that changes to these props update the tippy instance.
    get disabled() {
      return tippyProps.disabled
    },
    get hidden() {
      if (local.open !== undefined) {
        return !local.open
      }
      return tippyProps.hidden ?? true
    },
    get props() {
      return {
        animation: "scale-subtle",
        theme: "custom",
        ...tippyProps.props,
        // The `content` is a reactive getter that returns the container element
        // once it's rendered.
        content: contentContainer(),
        // When open is explicitly provided, disable trigger events
        ...(local.open !== undefined && { trigger: "manual", hideOnClick: false }),
      } satisfies TippyOptions["props"]
    },
  })

  return (
    <>
      {resolvedChildren()}
      {/*
        This container holds the tooltip content. It's hidden from view and its
        only purpose is to provide a DOM element for Tippy.js to manage. This
        pattern ensures that Solid's reactivity is preserved for the content,
        and it's compatible with server-side rendering and hydration.
      */}
      <div style={{ display: "none" }}>
        <div ref={setContentContainer}>{local.content}</div>
      </div>
    </>
  )
}
