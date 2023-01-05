import { useTranslation } from 'next-i18next'
import { DOMAIN_LOGO_BASE_URL } from 'utils/constants'

import styles from './styles.module.scss'

type Props = {
  domain: string
}

const TitleWithDomain = ({ domain = '' }: Props) => {
  const [t] = useTranslation('account')
  const logoUrl = DOMAIN_LOGO_BASE_URL + domain

  return (
    <div className={styles.title}>
      <span>{t(`basicInfo`)}</span>
      <div className={`${styles['logo-domain']} tooltip`} data-tooltip={domain}>
        <img src={logoUrl} loading="lazy" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <div className={styles.domian}>{domain}</div>
      </div>
    </div>
  )
}

export default TitleWithDomain
