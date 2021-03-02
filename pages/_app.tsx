import Layout from 'components/Layout'
import { appWithTranslation } from 'next-i18next'
import { AppProps } from 'next/app'
import '../styles/globals.css'

const Agera = ({ Component, pageProps }: AppProps) => (
  <Layout>
    <Component {...pageProps} />
  </Layout>
)

export default appWithTranslation(Agera)
