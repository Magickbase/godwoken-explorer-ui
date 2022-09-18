import { useTranslation } from 'next-i18next'
import Tooltip from 'components/Tooltip'
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
      <Tooltip title={t('pending')} placement="top">
        <PendingIcon />
      </Tooltip>
    )
  }

  if (!isSuccess) {
    return <FailedIcon style={{ flexShrink: 0 }} />
  }

  if (status === GraphQLSchema.BlockStatus.Committed) {
    return (
      <Tooltip title={t('committed')} placement="top">
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <CommittedIcon />
        </div>
      </Tooltip>
    )
  }
  if (status === GraphQLSchema.BlockStatus.Finalized) {
    return (
      <Tooltip title={t('finalized')} placement="top">
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <FinalizedIcon />
        </div>
      </Tooltip>
    )
  }

  return <FailedIcon style={{ flexShrink: 0 }} />
}

export default TxStatusIcon
