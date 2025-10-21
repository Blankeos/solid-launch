import { createEffect, createSignal } from "solid-js"

/** https://stackoverflow.com/questions/74987753/how-can-i-react-to-changes-in-the-window-size-in-solidjs */
export function useWindowSize() {
  const [width, setWidth] = createSignal(0)
  const [height, setHeight] = createSignal(0)

  const handleWindowResize = () => {
    setWidth(window.innerWidth)
    setHeight(window.innerHeight)
  }

  createEffect(() => {
    // component is mounted and window is available
    handleWindowResize()

    window.addEventListener("resize", handleWindowResize)

    // unsubscribe from the event on component unmount
    return () => window.removeEventListener("resize", handleWindowResize)
  })

  return { width, height }
}
