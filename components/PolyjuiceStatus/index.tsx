import { useTranslation } from 'next-i18next'
import SuccessIcon from 'assets/icons/success.svg'
import PendingIcon from 'assets/icons/pending.svg'
import FailedIcon from 'assets/icons/failed.svg'
import styles from './styles.module.scss'

const PolyjuiceStatus: React.FC<{ status: 'succeed' | 'failed' | 'pending' | null }> = ({ status }) => {
  const [t] = useTranslation('tx')

  if (!status) {
    return <span>-</span>
  }

  return (
    <div className={styles.container} title={t(status)} data-status={status}>
      {status === 'succeed' ? <SuccessIcon /> : null}
      {status === 'failed' ? <FailedIcon /> : null}
      {status === 'pending' ? <PendingIcon /> : null}
      {t(status)}
    </div>
  )
}

PolyjuiceStatus.displayName = 'PolyjuiceStatus'

export default PolyjuiceStatus
