import type { FlowProps } from "solid-js"
import VerticalLayout from "@/components/layouts/vertical/vertical-layout"

type LandingLayoutProps = {}

export default function LandingLayout(props: FlowProps<LandingLayoutProps>) {
  return <VerticalLayout>{props.children}</VerticalLayout>
}
