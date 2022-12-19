import HashLink from 'components/HashLink'
import Tooltip from 'components/Tooltip'
import { IMG_URL } from 'utils'

import styles from './styles.module.scss'

type Props = {
  domain: string
  hash: string
  href: string
}

const AddressWithDomain = ({ domain, hash, href = '' }: Props) => {
  return (
    <div className={styles.container}>
      <Tooltip title={domain} placement="top">
        <img src={`${IMG_URL}bit-logo.svg`} loading="lazy" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </Tooltip>
      <Tooltip title={hash} placement="top">
        <div style={{ paddingRight: 4 }}>
          <HashLink label={`${domain?.slice(0, 8)}...${domain?.slice(-8)}`} href={href} />
        </div>
      </Tooltip>
    </div>
  )
}

export default AddressWithDomain
