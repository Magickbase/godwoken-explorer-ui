import NextHead from 'next/head'
import { EXPLORER_TITLE } from 'utils'

const Head = () => (
  <NextHead>
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{EXPLORER_TITLE}</title>

    <link rel="shortcut icon" href="/favicon.ico" />
    <meta name="description" content={EXPLORER_TITLE} />
  </NextHead>
)

export default Head
