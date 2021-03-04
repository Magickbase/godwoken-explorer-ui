import Link from 'next/link'

import { CKB_EXPLORER_URL, NERVINA_GITHUB_URL, NERVINA_WEBSITE_URL, NERVOS_FOUNDATION_URL } from 'utils'

const links = [
  { label: 'Nervina Labs', url: NERVINA_WEBSITE_URL },
  { label: 'Nervos Foundation', url: NERVOS_FOUNDATION_URL },
  { label: 'GitHub', url: NERVINA_GITHUB_URL },
  { label: 'CKB Explorer', url: CKB_EXPLORER_URL },
]
const Footer = () => (
  <footer className="bg-black overflow-hidden relative" style={{ height: 156, marginTop: 60 }}>
    <div className="mx-auto flex flex-wrap mt-8 font-bold text-sm" style={{ width: 300 }}>
      {links.map(link => (
        <Link key={link.label} href={link.url}>
          <a className={'flex-0 w-1/2 text-white text-center pb-2 opacity-60 hover:opacity-100'} title={link.label}>
            {link.label}
          </a>
        </Link>
      ))}
    </div>
    <div className="w-full font-bold text-xs text-white opacity-60 text-center absolute bottom-5">
      Copyright &copy; 2021 Nervina Labs All Rights Reserved.
    </div>
  </footer>
)
export default Footer
