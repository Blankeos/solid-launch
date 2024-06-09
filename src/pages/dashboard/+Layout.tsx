import HorizontalLayout from '@/components/layouts/horizontal/horizontal-layout';
import Wrapper from '@/components/layouts/wrapper';
import { FlowProps } from 'solid-js';

type DashboardLayoutProps = {};

export default function DashboardLayout(props: FlowProps<DashboardLayoutProps>) {
  return (
    <Wrapper>
      <HorizontalLayout>{props.children}</HorizontalLayout>
    </Wrapper>
  );
}
