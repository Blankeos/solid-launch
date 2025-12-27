import { For } from "solid-js"
import { useMetadata } from "vike-metadata-solid"
import { Button } from "@/components/ui/button"
import { honoClient } from "@/lib/hono-client"
import getTitle from "@/utils/get-title"

export default function PricingPage() {
  useMetadata({
    title: getTitle("Pricing"),
  })

  const plans = [
    {
      name: "Starter",
      price: "$9",
      interval: "/mo",
      features: ["3 Projects", "1 GB Storage", "Email Support"],
      popular: false,
      variantId: "pdt_123", // Replace with actual variant ID
    },
    {
      name: "Professional",
      price: "$29",
      interval: "/mo",
      features: ["10 Projects", "10 GB Storage", "Priority Support", "Team Collaboration"],
      popular: true,
      variantId: "pdt_123", // Replace with actual variant ID
    },
    {
      name: "Enterprise",
      price: "$99",
      interval: "/mo",
      features: [
        "Unlimited Projects",
        "100 GB Storage",
        "Phone Support",
        "SLA",
        "Custom Integrations",
      ],
      popular: false,
      variantId: "pdt_123", // Replace with actual variant ID
    },
  ]

  const handleCheckout = async (variantId: string) => {
    try {
      const url = honoClient.payments.checkout[":variantId"]
        .$url({
          param: { variantId: variantId },
        })
        .toString()
      window.location.href = url
    } catch (error) {
      console.error("Error creating checkout:", error)
    }
  }

  return (
    <>
      <div class="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-y-8 px-8 py-16">
        <div class="flex flex-col items-center gap-y-2">
          <h1 class="font-bold text-4xl">Simple, Transparent Pricing</h1>
          <p class="text-lg text-muted-foreground">Choose the plan that fits your needs</p>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <For each={plans}>
            {(plan) => (
              <div
                class={`relative rounded-lg border p-6 ${
                  plan.popular ? "border-primary shadow-lg" : "border-border"
                }`}
              >
                {plan.popular && (
                  <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span class="rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground text-xs">
                      Most Popular
                    </span>
                  </div>
                )}

                <div class="mb-4">
                  <h3 class="font-semibold text-xl">{plan.name}</h3>
                  <div class="mt-2 flex items-baseline">
                    <span class="font-bold text-3xl">{plan.price}</span>
                    <span class="text-muted-foreground text-sm">{plan.interval}</span>
                  </div>
                </div>

                <ul class="mb-6 space-y-2">
                  <For each={plan.features}>
                    {(feature) => (
                      <li class="flex items-center gap-x-2">
                        <svg
                          class="h-4 w-4 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span class="text-sm">{feature}</span>
                      </li>
                    )}
                  </For>
                </ul>

                <Button
                  variant={plan.popular ? "default" : "outline"}
                  class="w-full"
                  onClick={() => handleCheckout(plan.variantId)}
                >
                  Get Started
                </Button>
              </div>
            )}
          </For>
        </div>
      </div>
    </>
  )
}
