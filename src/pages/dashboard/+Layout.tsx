import type { FlowProps } from "solid-js"
import HorizontalLayout from "@/components/layouts/horizontal/horizontal-layout"

type DashboardLayoutProps = {}

export default function DashboardLayout(props: FlowProps<DashboardLayoutProps>) {
  return <HorizontalLayout>{props.children}</HorizontalLayout>
}
