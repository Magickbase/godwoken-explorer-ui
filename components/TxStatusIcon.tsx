import { HourglassEmptyOutlined as PendingIcon } from '@mui/icons-material'
import { SxProps, Tooltip } from '@mui/material'
import CommittedIcon from 'assets/icons/committed.svg'
import FailedIcon from 'assets/icons/failed.svg'
import FinalizedIcon from 'assets/icons/finalized.svg'
import { useTranslation } from 'next-i18next'
import type { TxStatus } from 'utils'

const TxStatusIcon: React.FC<{ status: TxStatus; isSuccess?: boolean }> = ({ status, isSuccess = false }) => {
  const [t] = useTranslation('common')
  const properties: { sx: SxProps; color: 'success' | 'warning' } = {
    sx: { fontSize: 16, mr: 1 },
    color: isSuccess ? 'success' : 'warning',
  }
  if (!isSuccess) {
    return <FailedIcon style={{ flexShrink: 0 }} />
  }

  if (status === 'pending') {
    return (
      <Tooltip title={t(status)} placement="top">
        <PendingIcon {...properties} />
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
