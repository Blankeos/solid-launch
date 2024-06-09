import { FlowProps } from 'solid-js';
import VerticalFooter from './vertical-footer';
import VerticalNav from './vertical-nav';

type VerticalLayoutProps = {};

export default function VerticalLayout(props: FlowProps<VerticalLayoutProps>) {
  return (
    <div class="flex min-h-screen flex-col">
      <VerticalNav />
      <main class="flex flex-1 flex-col">{props.children}</main>
      <VerticalFooter />
    </div>
  );
}
