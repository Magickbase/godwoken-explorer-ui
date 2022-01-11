import { useEffect } from 'react'
import CssBaseLine from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { useRouter } from 'next/router'
import Layout from 'components/Layout'
import { appWithTranslation } from 'next-i18next'
import { AppProps } from 'next/app'
import ErrorBoundary from 'components/ErrorBoundary'
import { theme } from '../utils'
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseLine />

      <Layout>
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </Layout>
    </ThemeProvider>
  )
}

export default appWithTranslation(Agera)
