import Link from 'next/link'
import { explorerTitle } from 'utils'

const Header = () => (
  <header className="fixed t-0 l-0 w-full h-14 bg-black flex z-50">
    <div className="main-container items-center">
      <Link href="/">
        <a className="text-xl text-white font-bold no-underline flex-0">{explorerTitle}</a>
      </Link>
    </div>
  </header>
)
export default Header
