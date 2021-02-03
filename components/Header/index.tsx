import Link from 'next/link'
import Search from 'components/Search'

const Header = () => (
  <header className="flex bg-primary p-4 sticky top-0 left-0">
    <Link href="/">
      <a className="text-lg flex-1 text-white font-bold no-underline">Agera</a>
    </Link>
    <div className="flex flex-1">
      <Search />
    </div>
    <div className="flex-1"></div>
  </header>
)
export default Header
