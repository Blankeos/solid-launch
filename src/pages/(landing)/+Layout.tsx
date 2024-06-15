import VerticalLayout from '@/components/layouts/vertical/vertical-layout';
import { FlowProps } from 'solid-js';

type LandingLayoutProps = {};

export default function LandingLayout(props: FlowProps<LandingLayoutProps>) {
  return <VerticalLayout>{props.children}</VerticalLayout>;
}
