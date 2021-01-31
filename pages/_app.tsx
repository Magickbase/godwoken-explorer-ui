import Layout from 'components/Layout'
import { appWithTranslation } from 'utils/i18n'
import { AppProps } from 'next/app'
import '../styles/globals.css'

const Agera = ({ Component, pageProps }: AppProps) => (
  <Layout>
    <Component {...pageProps} />
  </Layout>
)

export default appWithTranslation(Agera)
