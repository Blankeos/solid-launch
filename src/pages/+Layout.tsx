import { FlowProps } from 'solid-js'

// CSS
import '@/lib/solid-tippy/tippy.css'
import '@/styles/app.css'
import '@/styles/bprogress.css'

import Wrapper from '@/components/layouts/wrapper'
import { useMetadata } from 'vike-metadata-solid'

useMetadata.setGlobalDefaults({
  title: 'Home | Solid Launch',
  description: 'An awesome app template by Carlo Taleon.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@carlo_taleon',
  },
  otherJSX: () => {
    return (
      <>
        <link rel="icon" href="/icon-logo.svg" />
      </>
    )
  },
})

export default function RootLayout(props: FlowProps) {
  return <Wrapper>{props.children}</Wrapper>
}
