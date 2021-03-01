import NextHead from 'next/head'
import { explorerTitle } from 'utils'

const Head = () => (
  <NextHead>
    <title>{explorerTitle}</title>
    <link rel="icon" href="/favicon.ico" />
  </NextHead>
)

export default Head
