import { FlowProps } from 'solid-js';

// CSS
import '@/styles/app.css';
import '@/styles/nprogress.css';

import Wrapper from '@/components/layouts/wrapper';

export default function RootLayout(props: FlowProps) {
  return <Wrapper>{props.children}</Wrapper>;
}
