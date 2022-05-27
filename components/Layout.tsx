import { Alert, Link } from '@mui/material'
import { useTranslation } from 'next-i18next'
import Head from 'components/Head'
import Header from 'components/Header'
import Footer from 'components/Footer'
import { GW_VERSION } from 'utils'

const Layout = ({ children }) => {
  const [t, { language }] = useTranslation('common')
  return (
    <>
      <Head />
      <Header />
      <main>
        {process.env.NEXT_PUBLIC_CHAIN_TYPE !== 'mainnet' ? (
          <Alert severity="info" sx={{ display: 'flex', justifyContent: 'center', borderRadius: 0 }}>
            {t(`testnetAnnotation`)}
            <Link
              href={`https://${process.env.NEXT_PUBLIC_MAINNET_EXPLORER_HOSTNAME}/${language}`}
              target="_blank"
              rel="noopener noreferrer"
              ml={1}
              color="secondary"
              sx={{ fontWeight: 700 }}
            >
              GwScan
            </Link>
          </Alert>
        ) : null}
        {GW_VERSION === 1 ? (
          <Alert severity="info" sx={{ display: 'flex', justifyContent: 'center', borderRadius: 0 }}>
            {t(`betanetAnnotation`)}
          </Alert>
        ) : null}
        {children}
      </main>
      <Footer />
    </>
  )
}
export default Layout
