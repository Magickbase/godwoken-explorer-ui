import { Html, Head, Main, NextScript } from 'next/document'
import { IS_MAINNET } from 'utils'

export default () => (
  <Html>
    <Head />
    <body attr-chain-type={IS_MAINNET ? 'mainnet' : 'testnet'}>
      <Main />
      <NextScript />
    </body>
  </Html>
)
