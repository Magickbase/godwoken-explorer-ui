import Tooltip from 'components/Tooltip'
import { TokenOrigins } from 'utils'
import styles from './styles.module.scss'

const TokenLogo: React.FC<{ logo: string; name: string }> = ({ name, logo }) => {
  const origin = TokenOrigins.find(o => name?.endsWith(` from ${o.name})`))

  const Token = logo ? (
    <img
      className={styles.token}
      src={logo}
      title={name}
      loading="lazy"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
    />
  ) : (
    <div className={styles.token}>{name?.[0] ?? '?'}</div>
  )

  if (!origin) {
    return Token
  }

  if (origin) {
    return (
      <Tooltip title={name} placement="top">
        <div className={styles.overlap}>
          <img
            className={styles.origin}
            src={origin.logo}
            loading="lazy"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
          {Token}
        </div>
      </Tooltip>
    )
  }
}

export default TokenLogo
