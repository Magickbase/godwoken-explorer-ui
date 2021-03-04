import NextHead from 'next/head'
import { EXPLORER_TITLE } from 'utils'

const Head = () => (
  <NextHead>
    <title>{EXPLORER_TITLE}</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  </NextHead>
)

export default Head
