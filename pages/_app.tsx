import { useEffect, useState } from 'react'
import { LinearProgress, ThemeProvider, CssBaseline } from '@mui/material'
import { useRouter } from 'next/router'
import Layout from 'components/Layout'
import { appWithTranslation } from 'next-i18next'
import { AppProps } from 'next/app'
import ErrorBoundary from 'components/ErrorBoundary'
import { theme } from '../utils'
import '../styles/globals.scss'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/material-icons'
import '@fontsource/jetbrains-mono'

const Agera = ({ Component, pageProps }: AppProps) => {
  const [loading, setLoading] = useState(0)
  const router = useRouter()

  useEffect(() => {
    let timer: number | null = null
    const step = () => {
      if (!timer) {
        return
      }
      setLoading(l => {
        switch (true) {
          case l >= 98: {
            return l
          }
          case l >= 90: {
            return l + 0.1
          }
          case l > 80: {
            return l + 1
          }
          default: {
            return l + 10
          }
        }
      })
      requestAnimationFrame(step)
    }

    const handleChangeStart = () => {
      document.body.classList.add('loading')
      if (timer !== null) {
        cancelAnimationFrame(timer)
        timer = null
      }
      timer = requestAnimationFrame(step)
    }
    const handleChangeComplete = () => {
      document.body.classList.remove('loading')
      if (timer) {
        cancelAnimationFrame(timer)
        timer = null
      }
      setLoading(100)
      setTimeout(() => {
        setLoading(0)
      }, 500)
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
      <CssBaseline />

      <Layout>
        <ErrorBoundary>
          {loading ? (
            <LinearProgress
              color="primary"
              variant="determinate"
              value={loading}
              sx={{
                display: 'block',
                position: 'fixed',
                width: '100%',
                opacity: 0.8,
                top: { xs: '56px', sm: '64px' },
              }}
            />
          ) : null}
          <Component {...pageProps} />
        </ErrorBoundary>
      </Layout>
    </ThemeProvider>
  )
}

export default appWithTranslation(Agera)
