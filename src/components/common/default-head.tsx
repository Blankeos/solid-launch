// Default <head> (can be overridden by pages)

import { mergeProps, VoidProps } from 'solid-js';

type DefaultHeadProps = {
  description?: string;
  imageURL?: string;
};

export function DefaultHead(props: VoidProps<DefaultHeadProps>) {
  const _props = mergeProps(
    {
      description: 'An awesome app template by Carlo Taleon.',
      imageURL: 'https://assets.solidjs.com/banner?type=SolidLaunch&background=tiles&project=%20'
    },
    props
  );

  return (
    <>
      <meta name="description" content={_props.description} />
      <link rel="icon" href="/favicon.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="og:image" content={_props.imageURL} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@carlo_taleon" />
      <meta name="twitter:title" content="Solid Launch" />
      <meta name="twitter:description" content={_props.description} />
      <meta name="twitter:image" content={_props.imageURL} />
    </>
  );
}
