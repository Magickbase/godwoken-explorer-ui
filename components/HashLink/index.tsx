import NextLink from 'next/link'
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material'
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
      target={external ? '_target' : '_self'}
      rel="noopener noreferrer"
    >
      {external ? (
        <>
          <span>{label}</span>
          <button>
            <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
          </button>
        </>
      ) : (
        label
      )}
    </a>
  </NextLink>
)

export default HashLink
