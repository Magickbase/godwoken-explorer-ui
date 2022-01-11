import { Alert, Link } from '@mui/material'
import { useTranslation } from 'next-i18next'
import Head from 'components/Head'
import Header from 'components/Header'
import Footer from 'components/Footer'

const Layout = ({ children }) => {
  const [t] = useTranslation('common')
  return (
    <>
      <Head />
      <Header />
      <main>
        {process.env.NEXT_PUBLIC_CHAIN_TYPE !== 'mainnet' ? (
          <Alert severity="info" sx={{ display: 'flex', justifyContent: 'center', borderRadius: 0 }}>
            {t(`testnetAnnotation`)}
            <Link
              href={`https://${process.env.NEXT_PUBLIC_MAINNET_EXPLORER_HOSTNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              ml={1}
              color="secondary"
              sx={{ fontWeight: 700 }}
            >
              Layerview
            </Link>
          </Alert>
        ) : null}
        {children}
      </main>
      <Footer />
    </>
  )
}
export default Layout
