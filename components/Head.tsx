import NextHead from 'next/head'
import { EXPLORER_TITLE } from 'utils'

const Head = () => (
  <NextHead>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{EXPLORER_TITLE}</title>

    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta name="description" content={EXPLORER_TITLE} />
  </NextHead>
)

export default Head
