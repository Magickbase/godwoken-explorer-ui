import NextHead from 'next/head'
import { EXPLORER_TITLE } from 'utils'

const Head = ({ subtitle }: { subtitle: string }) => (
  <NextHead>
    <title>{`${EXPLORER_TITLE} ${subtitle.length > 0 ? '|' : ''} ${subtitle}`}</title>
  </NextHead>
)

export default Head
