import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import * as SliderPrimitive from "@kobalte/core/slider"
import type { JSX, ValidComponent } from "solid-js"
import { children, createEffect, createSignal, onCleanup, Show, splitProps } from "solid-js"

import { Label } from "@/components/ui/label"
import { cn } from "@/utils/cn"

type SliderRootProps<T extends ValidComponent = "div"> = SliderPrimitive.SliderRootProps<T> & {
  class?: string | undefined
}

const Slider = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, SliderRootProps<T>>
) => {
  const [local, others] = splitProps(props as SliderRootProps, ["class"])
  return (
    <SliderPrimitive.Root
      class={cn("relative flex w-full touch-none select-none flex-col items-center", local.class)}
      {...others}
    />
  )
}

type SliderTrackProps<T extends ValidComponent = "div"> = SliderPrimitive.SliderTrackProps<T> & {
  class?: string | undefined
}

const SliderTrack = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, SliderTrackProps<T>>
) => {
  const [local, others] = splitProps(props as SliderTrackProps, ["class"])
  return (
    <SliderPrimitive.Track
      class={cn("relative h-2 w-full grow rounded-full bg-secondary", local.class)}
      {...others}
    />
  )
}

type SliderFillProps<T extends ValidComponent = "div"> = SliderPrimitive.SliderFillProps<T> & {
  class?: string | undefined
}

const SliderFill = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, SliderFillProps<T>>
) => {
  const [local, others] = splitProps(props as SliderFillProps, ["class"])
  return (
    <SliderPrimitive.Fill
      class={cn("absolute h-full rounded-full bg-primary", local.class)}
      {...others}
    />
  )
}

type SliderThumbProps<T extends ValidComponent = "span"> = SliderPrimitive.SliderThumbProps<T> & {
  class?: string | undefined
  children?: JSX.Element
}

const SliderThumb = <T extends ValidComponent = "span">(
  props: PolymorphicProps<T, SliderThumbProps<T>>
) => {
  const [local, others] = splitProps(props as SliderThumbProps, ["class", "children"])
  return (
    <SliderPrimitive.Thumb
      class={cn(
        "top-[-6px] block size-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        local.class
      )}
      {...others}
    >
      {local.children}
      <SliderPrimitive.Input />
    </SliderPrimitive.Thumb>
  )
}

const SliderLabel = <T extends ValidComponent = "label">(
  props: PolymorphicProps<T, SliderPrimitive.SliderLabelProps<T>>
) => {
  return <SliderPrimitive.Label as={Label} {...props} />
}

const SliderValueLabel = <T extends ValidComponent = "label">(
  props: PolymorphicProps<T, SliderPrimitive.SliderValueLabelProps<T>>
) => {
  return <SliderPrimitive.ValueLabel as={Label} {...props} />
}

export { Slider, SliderFill, SliderLabel, SliderThumb, SliderTrack, SliderValueLabel }

// ---

const SliderThumbWithTip = (
  props: { thumbTip?: (value: number) => JSX.Element } = {
    thumbTip: (value) => `${value}`,
  }
) => {
  let thumbRef: HTMLSpanElement | undefined

  const [value, setValue] = createSignal<number | undefined>(undefined)

  createEffect(() => {
    if (!thumbRef) return

    const update = () => {
      const val = thumbRef!.getAttribute("aria-valuenow")
      setValue(val ? parseFloat(val) : undefined)
    }

    update()
    const mo = new MutationObserver(update)
    mo.observe(thumbRef!, { attributes: true, attributeFilter: ["aria-valuenow"] })

    onCleanup(() => mo.disconnect())
  })

  return (
    // Thumb must be z-10 and tip must be z-20 (just above the thumb)
    <SliderThumb
      ref={thumbRef}
      class="group/thumb relative flex justify-center transition active:z-10 active:scale-93"
    >
      <Show when={props.thumbTip && value() !== undefined}>
        <span class="pointer-events-none absolute -bottom-8 left-1/2 z-20 -translate-x-1/2 transform animate-fadeOut rounded bg-black/90 px-2 py-1 text-white text-xs shadow-lg backdrop-blur group-focus-within:/thumb:animate-fadeIn group-active/thumb:animate-fadeIn">
          {props.thumbTip?.(value()!)}
        </span>
      </Show>
    </SliderThumb>
  )
}

type SliderCompProps = SliderPrimitive.SliderRootProps & {
  label?: JSX.Element
  class?: string

  // Personal touches
  showLabels?: boolean
  thumbTip?: (value: number) => JSX.Element
}

const SliderComp = (props: SliderCompProps) => {
  const [local, others] = splitProps(props, ["label", "class", "showLabels", "thumbTip"])
  const label = children(() => local.label)
  return (
    <Slider
      minValue={props.minValue ?? 0}
      maxValue={props.maxValue ?? 100}
      defaultValue={props.defaultValue ?? [25]}
      getValueLabel={props.getValueLabel}
      class={cn("w-[300px] space-y-3", local.class)}
      {...others}
    >
      <Show when={props.showLabels ?? true}>
        <div class="flex w-full justify-between">
          <Show when={label()}>
            <SliderLabel>{label()}</SliderLabel>
          </Show>
          <Show when={props.getValueLabel}>
            <SliderValueLabel />
          </Show>
        </div>
      </Show>

      <SliderTrack>
        <SliderFill />
        <SliderThumbWithTip thumbTip={local.thumbTip} />
        <SliderThumbWithTip thumbTip={local.thumbTip} />
      </SliderTrack>
    </Slider>
  )
}

export { SliderComp }
