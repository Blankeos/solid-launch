import { FlowProps } from 'solid-js';
import VerticalNav from './vertical-nav';
import VerticalFooter from './vertical-footer';

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
