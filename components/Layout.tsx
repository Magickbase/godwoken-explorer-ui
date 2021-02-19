import Head from 'components/Head'
import Header from 'components/Header'
import Footer from 'components/Footer'
const Layout = ({ children }) => {
  return (
    <>
      <Head />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
export default Layout
