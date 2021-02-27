import Link from 'next/link'

import { ckbExplorerUrl, nervinaGitHubUrl, nervinaWebsiteUrl, nervosFoundationUrl } from 'utils'

const links = [
  { label: 'Nervina Labs', url: nervinaWebsiteUrl },
  { label: 'Nervos Foundation', url: nervosFoundationUrl },
  { label: 'GitHub', url: nervinaGitHubUrl },
  { label: 'CKB Explorer', url: ckbExplorerUrl },
]
const Footer = () => (
  <footer className="bg-black overflow-hidden relative" style={{ height: 156 }}>
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
