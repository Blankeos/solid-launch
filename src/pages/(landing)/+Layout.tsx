import VerticalLayout from '@/components/layouts/vertical/vertical-layout';
import { FlowProps } from 'solid-js';

// CSS
import '@/styles/app.css';
import '@/styles/nprogress.css';

import Wrapper from '@/components/layouts/wrapper';

export default function App(props: FlowProps) {
  return (
    <>
      <Wrapper>
        <VerticalLayout>{props.children}</VerticalLayout>
      </Wrapper>
    </>
  );
}
