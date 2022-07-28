import { SxProps, Tooltip } from '@mui/material'
import PendingIcon from 'assets/icons/pending.svg'
import CommittedIcon from 'assets/icons/committed.svg'
import FailedIcon from 'assets/icons/failed.svg'
import FinalizedIcon from 'assets/icons/finalized.svg'
import { useTranslation } from 'next-i18next'
import type { TxStatus } from 'utils'

const TxStatusIcon: React.FC<{ status: TxStatus; isSuccess?: boolean }> = ({ status, isSuccess = false }) => {
  const [t] = useTranslation('common')
  if (!isSuccess) {
    return <FailedIcon style={{ flexShrink: 0 }} />
  }

  if (status === 'pending') {
    return (
      <Tooltip title={t(status)} placement="top">
        <PendingIcon />
      </Tooltip>
    )
  }
  if (status === 'committed') {
    return (
      <Tooltip title={t(status)} placement="top">
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <CommittedIcon />
        </div>
      </Tooltip>
    )
  }
  if (status === 'finalized') {
    return (
      <Tooltip title={t(status)} placement="top">
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <FinalizedIcon />
        </div>
      </Tooltip>
    )
  }
  return <FailedIcon style={{ flexShrink: 0 }} />
}

export default TxStatusIcon
