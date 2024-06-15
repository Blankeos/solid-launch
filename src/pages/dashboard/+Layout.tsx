import HorizontalLayout from '@/components/layouts/horizontal/horizontal-layout';
import { FlowProps } from 'solid-js';

type DashboardLayoutProps = {};

export default function DashboardLayout(props: FlowProps<DashboardLayoutProps>) {
  return <HorizontalLayout>{props.children}</HorizontalLayout>;
}
