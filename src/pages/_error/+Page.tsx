import { type JSX, Show } from "solid-js"
import { usePageContext } from "vike-solid/usePageContext"
import { Button } from "@/components/ui/button"

// Helper component for consistent error display, styled with Tailwind CSS
const ErrorDisplay = (props: {
  code: string
  title: string
  message: string
  children?: JSX.Element
}) => (
  <div class="flex flex-col items-center gap-y-4 text-center sm:flex-row sm:items-center sm:gap-x-5 sm:text-left">
    <h1 class="font-semibold text-5xl text-foreground">{props.code}</h1>
    {/* Vertical separator, only shown on sm screens and up (when flex-direction is row) */}
    <div class="hidden h-20 w-px bg-foreground sm:block" />
    <div class="flex flex-col">
      <h2 class="font-medium text-foreground text-xl">{props.title}</h2>
      <p class="mt-1 text-foreground/50 text-sm">{props.message}</p>
      {props.children}
    </div>
  </div>
)

const HomeButton = () => {
  return (
    <Button as="a" href="/" variant="secondary" class="mt-2">
      Go Home
    </Button>
  )
}

export default function Page() {
  const { is404, abortStatusCode, abortReason } = usePageContext()

  return (
    // Full-page container, centers content, applies base styling
    <div class="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground antialiased">
      <Show
        when={is404}
        fallback={
          <ErrorDisplay
            code={abortStatusCode?.toString() ?? "500"}
            title={
              ERROR_MAP[abortStatusCode as unknown as keyof typeof ERROR_MAP] ?? "Server Error"
            }
            message={
              (abortReason as string) ?? "Something went wrong on our end. Please try again later."
            }
          >
            <HomeButton />
          </ErrorDisplay>
        }
      >
        <ErrorDisplay
          code="404"
          title="Page Not Found"
          message="Sorry, this page could not be found."
        >
          <HomeButton />
        </ErrorDisplay>
      </Show>
    </div>
  )
}

const ERROR_MAP = {
  "500": "Server Error",
  "400": "Bad Request",
  "401": "Unauthorized",
  "403": "Forbidden",
  "404": "Page Not Found",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
}
