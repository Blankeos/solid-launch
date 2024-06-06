// Default <head> (can be overridden by pages)

export function Head() {
  return (
    <>
      <meta name="description" content="An awesome app template by Carlo Taleon." />
      <link rel="icon" href="/favicon.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta
        name="og:image"
        content="https://assets.solidjs.com/banner?type=SolidLaunch&background=tiles&project=%20"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@carlo_taleon" />
      <meta name="twitter:title" content="Solid Launch" />
      <meta name="twitter:description" content="An awesome app template by Carlo Taleon." />
      <meta
        name="twitter:image"
        content="https://assets.solidjs.com/banner?type=SolidLaunch&background=tiles&project=%20"
      />
    </>
  );
}
