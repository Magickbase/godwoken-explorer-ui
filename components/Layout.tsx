import Head from 'components/Head'
import Footer from 'components/Footer'
const Layout = ({ children }) => {
  return (
    <>
      <Head />
      {children}
      <Footer />
    </>
  )
}
export default Layout
