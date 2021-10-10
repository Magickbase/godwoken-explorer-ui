import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from 'components/Layout'
import { appWithTranslation } from 'next-i18next'
import { AppProps } from 'next/app'
import ErrorBoundary from 'components/ErrorBoundary'
import { MAINNET_HOSTNAME, TESTNET_HOSTNAME } from 'utils'
import '../styles/globals.css'

const Agera = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()

  useEffect(() => {
    const handleChangeStart = () => {
      document.body.classList.add('loading')
    }
    const handleChangeComplete = () => {
      document.body.classList.remove('loading')
    }
    router.events.on('routeChangeStart', handleChangeStart)
    router.events.on('routeChangeComplete', handleChangeComplete)
    return () => {
      router.events.off('routeChangeStart', handleChangeStart)
      router.events.off('routeChangeComplete', handleChangeComplete)
    }
  }, [])

  useEffect(() => {
    const { hostname, pathname } = window.location
    if (hostname.replace(/^www\./, '') === MAINNET_HOSTNAME) {
      window.alert(
        pathname.startsWith('/zh-CN')
          ? '主网版本尚未上线, 即将跳转到测试网版本'
          : 'Mainnet is not ready yet, redirect to testnet',
      )
      window.location.href = `//${TESTNET_HOSTNAME}${pathname}`
    }
  }, [])

  return (
    <Layout>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </Layout>
  )
}

export default appWithTranslation(Agera)
