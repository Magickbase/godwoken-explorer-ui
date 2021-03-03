import Head from 'components/Head'
import Header from 'components/Header'
import Footer from 'components/Footer'
import Search from 'components/Search'

const Layout = ({ children }) => {
  return (
    <>
      <Head />
      <Header />
      <Search />
      <main>{children}</main>
      <Footer />
    </>
  )
}
export default Layout
