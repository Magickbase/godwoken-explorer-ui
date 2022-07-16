import { Alert, Container, Link } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import Head from 'components/Head'
import Header from 'components/Header'
import Footer from 'components/Footer'
import Search from 'components/Search'

const Layout = ({ children }) => {
  const [t, { language }] = useTranslation('common')
  const { asPath } = useRouter()
  const isHome = asPath === '/' || asPath === '/zh-CN'

  return (
    <>
      <Head />
      <Header />
      <main>
        {process.env.NEXT_PUBLIC_CHAIN_TYPE !== 'mainnet' ? (
          <Alert
            severity="info"
            sx={{
              'display': 'flex',
              'justifyContent': 'center',
              'borderRadius': 0,
              'bgcolor': 'info.main',
              'color': '#333333',
              'fontSize': { xs: 12, md: 14 },
              'padding': '6px 14px',
              '& .MuiAlert-icon': {
                color: '#000000',
                mr: { xs: 0.5, md: 1 },
                fontSize: { xs: 12, md: 20 },
                py: { xs: 1.25, md: 1 },
              },
            }}
          >
            {t(`testnetAnnotation`)}
            <Link
              href={`https://${process.env.NEXT_PUBLIC_MAINNET_EXPLORER_HOSTNAME}/${language}`}
              target="_blank"
              rel="noopener noreferrer"
              ml={0.5}
              sx={{ fontWeight: 700, color: '#4C2CE4', textDecorationColor: '#4C2CE4' }}
            >
              GwScan
            </Link>
          </Alert>
        ) : null}
        {!isHome && (
          <Container
            sx={{
              px: { md: 2, lg: 0 },
              pb: 2,
              boxShadow: {
                xs: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                sm: 'none',
              },
              bgcolor: {
                xs: '#f8f8fb',
                sm: 'var(--bf-color)',
              },
            }}
          >
            <Search />
          </Container>
        )}
        {children}
      </main>
      <Footer />
    </>
  )
}
export default Layout
