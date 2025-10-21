import { usePageContext } from "vike-solid/usePageContext"
import { Button } from "@/components/ui/button"

export default function SuccessPage() {
  const { urlParsed } = usePageContext()
  // Based on https://docs.dodopayments.com/developer-resources/integration-guide
  const { payment_id, status } = urlParsed.search || {}

  return (
    <div class="flex min-h-screen items-center justify-center bg-background">
      <div class="w-full max-w-md rounded-xl border bg-card p-8 text-center text-card-foreground shadow">
        <div class="mb-6">
          {status === "succeeded" ? (
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                class="h-8 w-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : (
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                class="h-8 w-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        <h2 class="mb-2 font-bold text-3xl">
          {status === "succeeded" ? "Payment Successful!" : "Payment Failed"}
        </h2>
        <p class="mb-6 text-muted-foreground">
          {status === "succeeded"
            ? "Thank you for your purchase. Your payment has been processed successfully."
            : "Sorry, there was an issue processing your payment. Please try again."}
        </p>

        {payment_id && (
          <div class="mb-6 rounded-lg bg-muted p-4">
            <p class="text-muted-foreground text-sm">Payment ID</p>
            <p class="break-all font-mono text-sm">{payment_id}</p>
          </div>
        )}

        <Button as="a" href="/">
          Back to Home
        </Button>
      </div>
    </div>
  )
}
