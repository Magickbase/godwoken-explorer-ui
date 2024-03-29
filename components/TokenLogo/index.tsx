import Tooltip from 'components/Tooltip'
import { TokenOrigins, TokenLogoWhitelist } from 'utils'
import styles from './styles.module.scss'

const DEFAULT_LOGO_URL = '/icons/token-placeholder.svg'
const TokenLogo: React.FC<{ logo: string; name: string }> = ({ name, logo }) => {
  const origin = TokenOrigins.find(o => name?.endsWith(` from ${o.name})`))

  const logoUrl = logo || TokenLogoWhitelist.find(token => name?.startsWith(token.name))?.logo || DEFAULT_LOGO_URL

  const Token = (
    <img
      className={styles.token}
      src={logoUrl}
      title={name}
      loading="lazy"
      // crossOrigin="anonymous" // FIXME: YOK logo is forbidden by this policy
      referrerPolicy="no-referrer"
    />
  )

  if (!origin) {
    return (
      <Tooltip title={name} placement="top">
        <div>{Token}</div>
      </Tooltip>
    )
  }

  if (origin) {
    return (
      <Tooltip title={name} placement="top">
        <div className={styles.overlap}>
          <img
            className={styles.origin}
            src={origin.logo || DEFAULT_LOGO_URL}
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
