/**
 *
 * Usage
 * // Complex
 * const [open, data, actions] = useDisclosureData<{ idToDelete: string; onConfirm: () => Promise<void> }>();
 * <ConfirmationDialog
 *   title={`Delete record: ${data().idToDelete}?`}
 *   open={open()}
 *   onOpenChange={actions.set}
 *   onConfirm={data().onConfirm ?? (() => {})}
 * />
 *
 * ---
 *
 * // Simple
 * const [open, actions] = useDisclosure();
 * <ConfirmationDialog open={open()} onOpenChange={actions.set} onConfirm={() => { Your Logic Here... }} />
 */
import { mergeProps } from "solid-js"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

export function ConfirmationDialog(props: {
  open: boolean
  loading?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void> | void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}) {
  const mergedProps = mergeProps(
    {
      loading: false,
      title: "Are you sure?",
      description: "This action cannot be reversed.",
      confirmText: "Confirm",
      cancelText: "Cancel",
      confirmVariant: "default",
    },
    props
  )

  const handleConfirm = async () => {
    await mergedProps.onConfirm()
    mergedProps.onOpenChange(false) // Close the dialog after confirmation
  }

  return (
    <Dialog open={mergedProps.open} onOpenChange={mergedProps.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mergedProps.title}</DialogTitle>
          <DialogDescription>{mergedProps.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {/* Cancel Button */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              mergedProps.onOpenChange(false)
            }}
          >
            {mergedProps.cancelText}
          </Button>
          {/* Confirm Button */}
          <Button
            type="button"
            onClick={handleConfirm}
            loading={mergedProps.loading}
            variant={mergedProps.confirmVariant as any}
          >
            {mergedProps.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
