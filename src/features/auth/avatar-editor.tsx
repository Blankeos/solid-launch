import { type Component, createEffect, createSignal, onCleanup, onMount, Show } from "solid-js"

const AvatarEditor: Component<{
  image: HTMLImageElement | null
  scale: number
  rotation: number
  position: { x: number; y: number }
  shape?: "circle" | "square"
  onImageChange: (img: HTMLImageElement | null) => void
  onDrag: (pos: { x: number; y: number }) => void
  onFileLoad: (file: File) => void
  onFileDrop: (e: DragEvent) => void
}> = (props) => {
  let canvasRef!: HTMLCanvasElement
  let fileInputRef!: HTMLInputElement
  let containerRef!: HTMLDivElement

  const [dragging, setDragging] = createSignal(false)
  const [lastPos, setLastPos] = createSignal({ x: 0, y: 0 })

  const drawCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef
    const ctx = canvas.getContext("2d")!
    const size = 256
    canvas.width = size
    canvas.height = size
    ctx.clearRect(0, 0, size, size)

    if (props.shape === "circle") {
      ctx.save()
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      ctx.clip()
    }

    // Calculate bounds to keep image within canvas
    const scaledWidth = img.width * props.scale
    const scaledHeight = img.height * props.scale

    // Maximum allowed translation to keep image within bounds
    const maxX = (scaledWidth - size) / 2
    const maxY = (scaledHeight - size) / 2

    // Clamp position within bounds
    const clampedX = Math.max(-maxX, Math.min(maxX, props.position.x))
    const clampedY = Math.max(-maxY, Math.min(maxY, props.position.y))

    ctx.save()
    ctx.translate(size / 2, size / 2)
    ctx.rotate((props.rotation * Math.PI) / 180)
    ctx.scale(props.scale, props.scale)
    ctx.drawImage(img, -img.width / 2 + clampedX, -img.height / 2 + clampedY)
    ctx.restore()

    if (props.shape === "circle") {
      ctx.restore()
    }
  }

  const loadImage = (file: File) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      props.onImageChange(img)
      drawCanvas(img)
    }
    img.src = url
  }

  createEffect(() => {
    const img = props.image
    if (img) drawCanvas(img)
  })

  createEffect(() => {
    const img = props.image
    if (img) drawCanvas(img)
  })

  const handleDrag = (e: MouseEvent) => {
    if (!dragging()) return
    const dx = e.clientX - lastPos().x
    const dy = e.clientY - lastPos().y

    const img = props.image
    if (!img) return

    // Calculate bounds based on current scale
    const scaledWidth = img.width * props.scale
    const scaledHeight = img.height * props.scale
    const size = 256

    const maxX = (scaledWidth - size) / 2
    const maxY = (scaledHeight - size) / 2

    // Calculate new position with bounds
    const newX = props.position.x + dx
    const newY = props.position.y + dy

    const clampedX = Math.max(-maxX, Math.min(maxX, newX))
    const clampedY = Math.max(-maxY, Math.min(maxY, newY))

    props.onDrag({ x: clampedX, y: clampedY })
    setLastPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

  onMount(() => {
    window.addEventListener("mousemove", handleDrag)
    window.addEventListener("mouseup", handleMouseUp)
    onCleanup(() => {
      window.removeEventListener("mousemove", handleDrag)
      window.removeEventListener("mouseup", handleMouseUp)
    })
  })

  return (
    <div
      ref={containerRef!}
      class={`relative mx-auto size-64 border-2 border-border border-dashed ${
        props.shape === "circle" ? "rounded-full" : "rounded-lg"
      }`}
      onDrop={props.onFileDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Show
        when={props.image}
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
                  props.onFileLoad(file)
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
          class={`absolute inset-0 size-full ${
            props.shape === "circle" ? "rounded-full" : "rounded-lg"
          }`}
          onMouseDown={(e) => {
            setDragging(true)
            setLastPos({ x: e.clientX, y: e.clientY })
          }}
        />
      </Show>
    </div>
  )
}

export { AvatarEditor }

// ---

import { Button } from "@/components/ui/button"
import { SliderComp } from "@/components/ui/slider"
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
  const [image, setImage] = createSignal<HTMLImageElement | null>(null)
  const [scale, setScale] = createSignal(1)
  const [rotation, setRotation] = createSignal(0)
  const [position, setPosition] = createSignal({ x: 0, y: 0 })
  const [shape, setShape] = createSignal<"circle" | "square">("circle")

  const reset = () => {
    setImage(null)
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const onPaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile()
        if (file) loadImage(file)
        break
      }
    }
  }

  onMount(() => {
    window.addEventListener("paste", onPaste)
    onCleanup(() => window.removeEventListener("paste", onPaste))
  })

  const loadImage = (file: File) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => setImage(img)
    img.src = url
  }

  const handleSave = () => {
    if (!canvasRef) return
    const canvas = canvasRef
    const size = 256
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")!
    ctx.clearRect(0, 0, size, size)

    if (shape() === "circle") {
      ctx.save()
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      ctx.clip()
    }

    const img = image()
    if (img) {
      ctx.save()
      ctx.translate(size / 2, size / 2)
      ctx.rotate((rotation() * Math.PI) / 180)
      ctx.scale(scale(), scale())
      ctx.drawImage(img, -img.width / 2 + position().x, -img.height / 2 + position().y)
      ctx.restore()

      if (shape() === "circle") ctx.restore()

      canvas.toBlob((blob) => {
        if (!blob) return
        const reader = new FileReader()
        reader.onloadend = () => {
          props.onSave(reader.result as string)
          props.onOpenChange(false)
        }
        reader.readAsDataURL(blob)
      })
    }
  }

  const onFileDrop = (e: DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer?.files
    if (files?.[0]) loadImage(files[0])
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent class="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Avatar</DialogTitle>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="flex items-center gap-4">
            <label class="text-sm">Shape</label>
            <Button
              variant={shape() === "circle" ? "default" : "secondary"}
              size="sm"
              onClick={() => setShape("circle")}
            >
              Circle
            </Button>
            <Button
              variant={shape() === "square" ? "default" : "secondary"}
              size="sm"
              onClick={() => setShape("square")}
            >
              Square
            </Button>
          </div>
          <AvatarEditor
            image={image()}
            scale={scale()}
            rotation={rotation()}
            position={position()}
            shape={shape()}
            onImageChange={setImage}
            onDrag={setPosition}
            onFileLoad={loadImage}
            onFileDrop={onFileDrop}
          />
          <Show when={image()}>
            <div class="flex flex-col gap-4">
              <div class="grid gap-2">
                <label class="text-sm">Zoom</label>
                <SliderComp
                  minValue={0.5}
                  maxValue={3}
                  step={0.1}
                  defaultValue={[scale()]}
                  onChange={(v) => setScale(v[0])}
                  class="w-full"
                />
              </div>
              <div class="grid gap-2">
                <label class="text-sm">Rotation</label>
                <SliderComp
                  minValue={-180}
                  maxValue={180}
                  step={1}
                  defaultValue={[rotation()]}
                  onChange={(v) => setRotation(v[0])}
                  class="w-full"
                />
              </div>
              <div class="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setRotation((r) => r - 90)}>
                  ↺ 90°
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setRotation((r) => r + 90)}>
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
