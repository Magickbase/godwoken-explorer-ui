import HashLink from 'components/HashLink'
import Tooltip from 'components/Tooltip'
import { IMG_URL } from 'utils'

import styles from './styles.module.scss'

type Props = {
  domain: string
  hash: string
  href: string
  leading?: number
}

const AddressWithDomain = ({ domain, hash, href = '', leading = 8 }: Props) => {
  return (
    <div className={styles.container}>
      <Tooltip title={domain} placement="top">
        <img src={`${IMG_URL}bit-logo.svg`} loading="lazy" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </Tooltip>
      <Tooltip title={hash} placement="top">
        <div>
          <HashLink
            label={domain?.length > leading * 2 ? `${domain?.slice(0, leading)}...${domain?.slice(-leading)}` : domain}
            href={href}
          />
        </div>
      </Tooltip>
    </div>
  )
}

export default AddressWithDomain
