import { type Component, onCleanup, onMount, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SliderComp } from "@/components/ui/slider"
import { honoClient } from "@/lib/hono-client"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { useAuthContext } from "./auth.context"
import { AvatarEditor, createAvatarEditor } from "./avatar-editor"

const AvatarEditorDialog: Component<{
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (dataUrl: string) => void
}> = (props) => {
  const { refresh } = useAuthContext()

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

    // convert to heic here

    // STEP 1: Upload to S3
    let avatarObjectId: string | undefined
    if (blob) {
      const toastId = toast.loading("Uploading avatar...")

      const uploadSignedUrlResponse = await honoClient.auth.profile.avatar["upload-url"].$post()
      const { objectKey, uploadUrl } = await uploadSignedUrlResponse.json()

      try {
        // Use native fetch instead of axios
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: blob,
          headers: {
            "Content-Type": blob.type,
          },
        })
        if (!uploadResponse.ok) {
          throw new Error((await uploadResponse.text()) ?? "Failed to upload")
        }

        avatarObjectId = objectKey
        toast.success("Avatar uploaded successfully!", { id: toastId })
      } catch (error) {
        console.error("Avatar upload failed:", error)
        toast.error("Failed to upload avatar.", { id: toastId })
        return
      }
    }

    // STEP 2: Save to DB
    if (!avatarObjectId) {
      toast.error("No uploaded id found. This is a bug.")
      return
    }

    const toastId2 = toast.loading("Saving account settings...")
    await honoClient.auth.profile.$put({
      json: {
        avatar_object_id: avatarObjectId,
      },
    })

    // Invalidate
    await refresh.run()

    toast.success("User profile updated successfully.", { id: toastId2 })
    props.onOpenChange?.(false)
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
