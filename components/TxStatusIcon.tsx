import { useTranslation } from 'next-i18next'
import PendingIcon from 'assets/icons/pending.svg'
import CommittedIcon from 'assets/icons/committed.svg'
import FailedIcon from 'assets/icons/failed.svg'
import FinalizedIcon from 'assets/icons/finalized.svg'
import { GraphQLSchema } from 'utils'

const TxStatusIcon: React.FC<{ status: GraphQLSchema.BlockStatus | null; isSuccess?: boolean }> = ({
  status,
  isSuccess = false,
}) => {
  const [t] = useTranslation('common')

  if (status === GraphQLSchema.BlockStatus.Pending || !status) {
    return (
      // TODO  there is no div before, should be verified in page later
      <div className="tooltip" data-tooltip={t('pending')}>
        <PendingIcon />
      </div>
    )
  }

  if (!isSuccess) {
    return <FailedIcon style={{ flexShrink: 0 }} />
  }

  if (status === GraphQLSchema.BlockStatus.Committed) {
    return (
      <div
        className="tooltip"
        data-tooltip={t('committed')}
        style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
      >
        <CommittedIcon />
      </div>
    )
  }
  if (status === GraphQLSchema.BlockStatus.Finalized) {
    return (
      <div
        className="tooltip"
        data-tooltip={t('finalized')}
        style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
      >
        <FinalizedIcon />
      </div>
    )
  }

  return <FailedIcon style={{ flexShrink: 0 }} />
}

export default TxStatusIcon
