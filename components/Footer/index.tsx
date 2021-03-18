import Link from 'next/link'

import { CKB_EXPLORER_URL, NERVINA_GITHUB_URL, NERVINA_WEBSITE_URL, NERVOS_FOUNDATION_URL } from 'utils'
import styles from './footer.module.css'

const links = [
  { label: 'Nervina Labs', url: NERVINA_WEBSITE_URL },
  { label: 'Nervos Foundation', url: NERVOS_FOUNDATION_URL },
  { label: 'GitHub', url: NERVINA_GITHUB_URL },
  { label: 'CKB Explorer', url: CKB_EXPLORER_URL },
]
const Footer = () => (
  <footer className={styles.container}>
    <div className={styles.links}>
      {links.map(link => (
        <Link key={link.label} href={link.url}>
          <a title={link.label} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        </Link>
      ))}
    </div>
    <div className={styles.copyright}>Copyright &copy; 2021 Nervina Labs All Rights Reserved.</div>
  </footer>
)
export default Footer
