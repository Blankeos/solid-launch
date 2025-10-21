import { createEffect, createSignal } from "solid-js"

/**
 * Using signals as refs: https://docs.solidjs.com/concepts/refs (Important because ref won't work if you wrap the element in a conditional).
 * Resize Observer: https://stackoverflow.com/questions/5570390/resize-event-for-textarea
 */
export function useClientSize() {
  const [ref, setRef] = createSignal<HTMLElement>()
  const [width, setWidth] = createSignal(0)
  const [height, setHeight] = createSignal(0)

  const handleClientResize = () => {
    if (!ref()) return

    const rect = ref()!.getBoundingClientRect()

    setWidth(() => rect.width)
    setHeight(() => rect.height)
  }

  createEffect(() => {
    if (!ref()) return

    // component is mounted and window is available
    handleClientResize()

    const resizeObserver = new ResizeObserver(handleClientResize)
    resizeObserver.observe(ref()!)

    // unsubscribe from the event on component unmount
    return () => resizeObserver.disconnect()
  })

  return { width, height, clientRef: (el: HTMLElement | any) => setRef(el) }
}
