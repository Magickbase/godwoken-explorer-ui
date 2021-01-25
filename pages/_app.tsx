import Layout from 'components/Layout'
import { AppProps } from 'next/app'
import '../styles/globals.scss'

const Agera = ({ Component, pageProps }: AppProps) => (
  <Layout>
    <Component {...pageProps} />
  </Layout>
)

export default Agera
