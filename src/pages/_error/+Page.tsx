import getTitle from '@/utils/get-title';
import { Show } from 'solid-js';
import { useMetadata } from 'vike-metadata-solid';
import { usePageContext } from 'vike-solid/usePageContext';

export default function Page() {
  const { is404 } = usePageContext();

  useMetadata({
    title: getTitle(is404 ? '404' : '500'),
  });

  return (
    <Show
      when={is404}
      fallback={
        <>
          <h1>500 Internal Server Error</h1>
          <p>Something went wrong.</p>
        </>
      }
    >
      <h1>404 Page Not Found</h1>
      <p>This page could not be found.</p>
    </Show>
  );
}
