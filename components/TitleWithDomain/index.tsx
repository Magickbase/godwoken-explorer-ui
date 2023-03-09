import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { BIT_DATA_BASE_URL, BIT_LOGO_BASE_URL } from 'utils/constants'

import styles from './styles.module.scss'

type Props = {
  domain: string
}

const TitleWithDomain = ({ domain = '' }: Props) => {
  const [t] = useTranslation('account')
  const logoUrl = BIT_LOGO_BASE_URL + domain
  const bitUrl = BIT_DATA_BASE_URL + domain

  return (
    <div className={styles.title}>
      <span>{t(`basicInfo`)}</span>

      <NextLink href={bitUrl}>
        <a target="_blank" rel="noopener noreferrer">
          <div className={`${styles['logo-domain']} tooltip`} data-tooltip={domain}>
            <img src={logoUrl} loading="lazy" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            <div className={styles.domian}>{domain}</div>
          </div>
        </a>
      </NextLink>
    </div>
  )
}

export default TitleWithDomain
