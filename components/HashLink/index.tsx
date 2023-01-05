import { ReactNode } from 'react'
import NextLink from 'next/link'
import OpenInNewIcon from 'assets/icons/open-in-new.svg'
import styles from './styles.module.scss'

interface HashLinkProps {
  label: string | ReactNode
  href: string
  external?: boolean
  style?: React.CSSProperties
  monoFont?: boolean
}

const HashLink: React.FC<HashLinkProps> = ({ label, href, external = false, style, monoFont = true }) => (
  <NextLink href={href}>
    <a
      href={href}
      className={`${styles.container} ${monoFont ? 'mono-font' : ''}`}
      style={style}
      target={external ? '_blank' : '_self'}
      rel="noopener noreferrer"
    >
      {external ? (
        <>
          <span>{label}</span>
          <button>
            <OpenInNewIcon />
          </button>
        </>
      ) : (
        label
      )}
    </a>
  </NextLink>
)

export default HashLink
