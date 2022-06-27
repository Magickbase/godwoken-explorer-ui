import NextLink from 'next/link'
import OpenInNewIcon from 'assets/icons/open-in-new.svg'
import styles from './styles.module.scss'

interface HashLinkProps {
  label: string
  href: string
  external?: boolean
  style?: React.CSSProperties
}

const HashLink: React.FC<HashLinkProps> = ({ label, href, external = false, style }) => (
  <NextLink href={href}>
    <a
      href={href}
      title={label}
      className={`${styles.container} mono-font`}
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
