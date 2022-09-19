import { useTranslation } from 'next-i18next'
import SuccessIcon from 'assets/icons/success.svg'
import PendingIcon from 'assets/icons/pending.svg'
import FailedIcon from 'assets/icons/failed.svg'
import { GraphQLSchema } from 'utils'
import styles from './styles.module.scss'

const PolyjuiceStatus: React.FC<{ status: GraphQLSchema.PolyjuiceStatus | null }> = ({ status }) => {
  const [t] = useTranslation('tx')

  if (!status) {
    return <span>-</span>
  }

  return (
    <div className={styles.container} title={t(status.toLowerCase())} data-status={status.toLowerCase()}>
      {status === GraphQLSchema.PolyjuiceStatus.Succeed ? <SuccessIcon /> : null}
      {status === GraphQLSchema.PolyjuiceStatus.Failed ? <FailedIcon /> : null}
      {status === GraphQLSchema.PolyjuiceStatus.Pending ? <PendingIcon /> : null}
      {t(status.toLowerCase())}
    </div>
  )
}

PolyjuiceStatus.displayName = 'PolyjuiceStatus'

export default PolyjuiceStatus
