import { mergeProps, VoidProps } from 'solid-js';

type VerticalFooterProps = {};

export default function VerticalFooter(props: VoidProps<VerticalFooterProps>) {
  return (
    <footer class="flex h-32 items-center justify-center">
      Carlo Taleon ©️ All Rights Reserved.
    </footer>
  );
}
