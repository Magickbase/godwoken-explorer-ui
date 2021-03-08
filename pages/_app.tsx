import Layout from 'components/Layout'
import { appWithTranslation } from 'next-i18next'
import { AppProps } from 'next/app'
import ErrorBoundary from 'components/ErrorBoundary'
import '../styles/globals.css'

const Agera = ({ Component, pageProps }: AppProps) => (
  <Layout>
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  </Layout>
)

export default appWithTranslation(Agera)
