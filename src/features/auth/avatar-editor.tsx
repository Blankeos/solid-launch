import { type Component, createEffect, createSignal, onCleanup, onMount, Show } from "solid-js"

const _CropFrame = (props: { radius: string; opacity: number; size: number }) => {
  const base = "absolute inset-0 pointer-events-none z-10"
  const [canvasRef, setCanvasRef] = createSignal<HTMLCanvasElement>()

  createEffect(() => {
    if (!canvasRef() || props.opacity <= 0) return

    const canvas = canvasRef()!
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw black overlay with opacity
    ctx.fillStyle = `rgba(0, 0, 0, ${props.opacity})`
    ctx.fillRect(0, 0, width, height)

    // Draw white cutout with rounded corners
    ctx.globalCompositeOperation = "destination-out"
    ctx.fillStyle = "white"

    if (props.radius === "50%") {
      // Circular cutout
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // Rounded rectangle cutout
      const radiusPx = props.radius === "0px" ? 0 : parseInt(props.radius, 10)
      ctx.beginPath()
      ctx.roundRect(0, 0, width, height, radiusPx)
      ctx.fill()
    }

    // Reset composite operation
    ctx.globalCompositeOperation = "source-over"
  })

  return (
    <Show when={props.opacity > 0}>
      {/*<div class="absolute inset-0 bg-red-400"></div>*/}
      <canvas ref={setCanvasRef} class={base} width={props.size} height={props.size} />
    </Show>
  )
}

// Avatar Editor Hook
const createAvatarEditor = (options?: {
  /** @defaultValue 256 */
  size?: number
}) => {
  const sizeValue = options?.size ?? 256
  const [image, setImage] = createSignal<HTMLImageElement | null>(null)
  const [scale, setScale] = createSignal(1)
  const [rotation, setRotation] = createSignal(0)
  const [position, setPosition] = createSignal({ x: 0, y: 0 })
  const [shape, setShape] = createSignal<number>(100) // 0-100 where 100 is circle

  const reset = () => {
    setImage(null)
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setShape(100)
  }

  const loadImage = (file: File) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setImage(img)
      // Reset scale to "object-contain" equivalent when image loads
      const containScale = Math.min(sizeValue / img.width, sizeValue / img.height)
      setScale(containScale)
    }
    img.src = url
  }

  // Calculate "object-contain" scale for the current image
  const getContainScale = (img: HTMLImageElement | null) => {
    if (!img) return 1
    return Math.min(sizeValue / img.width, sizeValue / img.height)
  }

  // Calculate maximum zoom scale (10x the contain scale)
  const getMaxScale = (img: HTMLImageElement | null) => {
    if (!img) return 10
    return getContainScale(img) * 10
  }

  const getCroppedImage = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      canvas.width = sizeValue
      canvas.height = sizeValue
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(null)
        return
      }

      ctx.clearRect(0, 0, sizeValue, sizeValue)

      const img = image()
      if (img) {
        ctx.save()
        ctx.translate(sizeValue / 2, sizeValue / 2)
        ctx.rotate((rotation() * Math.PI) / 180)
        ctx.scale(scale(), scale())
        ctx.drawImage(img, -img.width / 2 + position().x, -img.height / 2 + position().y)
        ctx.restore()

        ctx.restore() // Restore clipping context
      }

      canvas.toBlob(resolve)
    })
  }

  const onFileDrop = (e: DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer?.files
    if (files?.[0]) loadImage(files[0])
  }

  return {
    // State
    size: sizeValue,
    image,
    scale,
    rotation,
    position,
    shape,

    // Actions
    setImage,
    setScale,
    setRotation,
    setPosition,
    setShape,
    reset,
    loadImage,
    onFileDrop,
    getCroppedImage,
    getContainScale,
    getMaxScale,
  }
}

const AvatarEditor: Component<
  ReturnType<typeof createAvatarEditor> & {
    /** Additional CSS classes */
    class?: string
    /** 0-1 opacity of the black "negative space" overlay (visual only, does NOT affect output) */
    cropFrameOpacity?: number
    /** "full" | number (px) - shape of the overlay (visual only, does NOT affect output) */
    cropFrameBorderRadius?: number | "full"
    /** Size of the avatar editor in pixels (1:1 aspect ratio) @defaultValue 256 */
    size?: number
  }
> = (props) => {
  let canvasRef!: HTMLCanvasElement
  let fileInputRef!: HTMLInputElement
  let containerRef!: HTMLDivElement

  const [dragging, setDragging] = createSignal(false)
  const [lastPos, setLastPos] = createSignal({ x: 0, y: 0 })

  /* ---------- visual-only helpers ---------- */
  const cropFrameOpacity = () => props.cropFrameOpacity ?? 0.5
  const cropFrameBorderRadius = () => {
    if (props.cropFrameBorderRadius === "full" || props.cropFrameBorderRadius === 100) return "50%"
    if (props.cropFrameBorderRadius !== undefined) return `${props.cropFrameBorderRadius}px`
    return "0px"
  }

  /* ---------- canvas drawing (affects output) ---------- */
  const drawCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef
    const size = props.size ?? 256
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")!
    ctx.clearRect(0, 0, size, size)

    // translate/rotate/scale the image itself (output-affecting)
    ctx.save()
    ctx.translate(size / 2, size / 2)
    ctx.rotate((props.rotation() * Math.PI) / 180)
    ctx.scale(props.scale(), props.scale())
    ctx.drawImage(img, -img.width / 2 + props.position().x, -img.height / 2 + props.position().y)
    ctx.restore()
  }

  /* ---------- visual overlay (div on top, pointer-events-none) ---------- */

  /* ---------- file handling ---------/ */
  const loadImage = (file: File) => {
    props.loadImage(file)
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      props.setImage(img)
      drawCanvas(img)
    }
    img.src = url
  }

  /* ---------- reactive redraw ---------- */
  createEffect(() => {
    const img = props.image()
    if (img) drawCanvas(img)
  })

  /* ---------- drag handling ---------- */
  const handleDrag = (e: MouseEvent) => {
    if (!dragging()) return
    const dx = e.clientX - lastPos().x
    const dy = e.clientY - lastPos().y

    const img = props.image()
    if (!img) return

    // Convert screen-space delta into rotated image-space delta
    const angleRad = (-props.rotation() * Math.PI) / 180 // negate for inverse rotation
    const rotatedDx = dx * Math.cos(angleRad) - dy * Math.sin(angleRad)
    const rotatedDy = dx * Math.sin(angleRad) + dy * Math.cos(angleRad)

    // Scale the drag delta to be proportional to the zoom level
    const scaleAwareDx = rotatedDx / props.scale()
    const scaleAwareDy = rotatedDy / props.scale()

    const newX = props.position().x + scaleAwareDx
    const newY = props.position().y + scaleAwareDy

    props.setPosition({ x: newX, y: newY })
    setLastPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => setDragging(false)

  onMount(() => {
    window.addEventListener("mousemove", handleDrag)
    window.addEventListener("mouseup", handleMouseUp)
    onCleanup(() => {
      window.removeEventListener("mousemove", handleDrag)
      window.removeEventListener("mouseup", handleMouseUp)
    })
  })

  /* ---------- render ---------- */
  const size = props.size ?? 256
  console.log("ITLOG", size)

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: It works
    <div
      ref={containerRef!}
      class={cn("relative", props.class)}
      style={{ width: `${size}px`, height: `${size}px` }}
      onDrop={props.onFileDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Show
        when={props.image()}
        fallback={
          <label class="flex h-full cursor-pointer items-center justify-center">
            <input
              ref={fileInputRef!}
              type="file"
              accept="image/*"
              class="sr-only"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0]
                if (file) {
                  loadImage(file)
                }
              }}
            />
            <div class="text-center">
              <p class="text-muted-foreground text-sm">Drop image or click to upload</p>
              <p class="text-muted-foreground text-xs">Or paste from clipboard</p>
            </div>
          </label>
        }
      >
        <canvas
          ref={canvasRef!}
          class="absolute inset-0 size-full"
          onMouseDown={(e) => {
            setDragging(true)
            setLastPos({ x: e.clientX, y: e.clientY })
          }}
        />
        <_CropFrame opacity={cropFrameOpacity()} radius={cropFrameBorderRadius()} size={size} />
      </Show>
    </div>
  )
}

export { AvatarEditor, createAvatarEditor }

// ---
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SliderComp } from "@/components/ui/slider"
import { cn } from "@/utils/cn"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"

const AvatarEditorDialog: Component<{
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (dataUrl: string) => void
}> = (props) => {
  let canvasRef!: HTMLCanvasElement
  const editor = createAvatarEditor({ size: 512 })

  const reset = () => {
    editor.reset()
  }

  const onPaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile()
        if (file) editor.loadImage(file)
        break
      }
    }
  }

  onMount(() => {
    window.addEventListener("paste", onPaste)
    onCleanup(() => window.removeEventListener("paste", onPaste))
  })

  const handleSave = async () => {
    const blob = await editor.getCroppedImage()
    if (!blob) return
    const dataUrl = URL.createObjectURL(blob)
    window.open(dataUrl, "_blank")

    const reader = new FileReader()
    reader.onloadend = () => {
      props.onSave(reader.result as string)
      // props.onOpenChange(false)
    }
    reader.readAsDataURL(blob)
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent class="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Avatar</DialogTitle>
        </DialogHeader>
        <div class="flex flex-col gap-4 py-4">
          <div class="flex flex-col gap-4 rounded-md border p-3 px-5 pb-5">
            <div>
              <Badge variant="info">Visual-only</Badge>
            </div>
            <div class="flex items-center gap-4">
              <label class="flex gap-1 text-sm" for="shape-label">
                Crop shape
              </label>
              <Button
                variant={editor.shape() === 100 ? "default" : "secondary"}
                size="sm"
                onClick={() => editor.setShape(100)}
              >
                Circle
              </Button>
              <Button
                variant={editor.shape() === 0 ? "default" : "secondary"}
                size="sm"
                onClick={() => editor.setShape(0)}
              >
                Square
              </Button>
            </div>
            <div class="grid gap-2">
              <SliderComp
                label="Crop roundness"
                value={[editor.shape()]}
                getValueLabel={(v) => (v.values.at(0) === 100 ? "100%" : `${v.values}px`)}
                id="shape-slider"
                minValue={0}
                maxValue={100}
                step={1}
                defaultValue={[editor.shape()]}
                onChange={(v) => editor.setShape(v[0])}
                class="w-full"
              />
            </div>
          </div>

          <div class="mx-auto border-2 border-dashed">
            <AvatarEditor
              cropFrameOpacity={0.8}
              cropFrameBorderRadius={editor.shape()}
              {...editor}
            />
          </div>

          <Show when={editor.image()}>
            <div class="flex flex-col gap-4">
              <div class="grid gap-2">
                <SliderComp
                  label="Zoom"
                  getValueLabel={(v) => `${Math.round((v.values?.at(0) ?? 0) * 100)}%`}
                  id="zoom-label"
                  minValue={0}
                  maxValue={1}
                  step={0.01}
                  defaultValue={[1]}
                  value={[editor.scale() / editor.getMaxScale(editor.image())]}
                  onChange={(v) => {
                    const normalizedValue = v[0]
                    const maxScale = editor.getMaxScale(editor.image())
                    editor.setScale(normalizedValue * maxScale)
                  }}
                  class="w-full"
                />
              </div>
              <div class="grid gap-2">
                <SliderComp
                  label="Rotation"
                  getValueLabel={(v) => `${v.values}°`}
                  id="rotation-label"
                  minValue={-180}
                  maxValue={180}
                  step={1}
                  defaultValue={[editor.rotation()]}
                  onChange={(v) => editor.setRotation(v[0])}
                  class="w-full"
                />
              </div>
              <div class="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => editor.setRotation((r) => r - 90)}
                >
                  ↺ 90°
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => editor.setRotation((r) => r + 90)}
                >
                  ↻ 90°
                </Button>
                <Button variant="destructive" size="sm" class="ml-auto" onClick={reset}>
                  Reset
                </Button>
              </div>
            </div>
          </Show>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => props.onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
        <canvas ref={canvasRef} class="hidden" />
      </DialogContent>
    </Dialog>
  )
}

export { AvatarEditorDialog }
