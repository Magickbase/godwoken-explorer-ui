import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from 'components/Layout'
import { appWithTranslation, useTranslation } from 'next-i18next'
import { AppProps } from 'next/app'
import ErrorBoundary from 'components/ErrorBoundary'
import { MAINNET_HOSTNAME, TESTNET_HOSTNAME } from 'utils'
import '../styles/globals.css'

const Agera = ({ Component, pageProps }: AppProps) => {
  const router = useRouter()
  const [t, { language }] = useTranslation('common')

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
    if (window.location.hostname.replace(/^www\./, '') === MAINNET_HOSTNAME) {
      window.alert(
        language === 'zh-US'
          ? '主网版本尚未上线, 即将跳转到测试网版本'
          : 'Mainnet is not ready yet, redirect to testnet',
      )
      window.location.href = `//${TESTNET_HOSTNAME}/${language}`
    }
  }, [t, language])

  return (
    <Layout>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </Layout>
  )
}

export default appWithTranslation(Agera)
