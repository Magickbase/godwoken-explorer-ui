import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { DOMAIN_LOGO_BASE_URL } from 'utils/constants'

import styles from './styles.module.scss'

type Props = {
  domain: string
}

const BIT_PAGE = 'https://data.did.id'

const TitleWithDomain = ({ domain = '' }: Props) => {
  const [t] = useTranslation('account')
  const logoUrl = DOMAIN_LOGO_BASE_URL + domain

  return (
    <div className={styles.title}>
      <span>{t(`basicInfo`)}</span>
      <div className={`${styles['logo-domain']} tooltip`} data-tooltip={domain}>
        <img src={logoUrl} loading="lazy" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <Link href={`${BIT_PAGE}/${domain}`}>
          <a className={styles.domain} target="_blank" rel="noopener noreferrer">
            {domain}
          </a>
        </Link>
      </div>
    </div>
  )
}

export default TitleWithDomain
