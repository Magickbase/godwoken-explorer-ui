import {
  HourglassEmptyOutlined as PendingIcon,
  Done as CommittedIcon,
  DoneAllOutlined as FinalizedIcon,
  ErrorOutlineOutlined as ErrorIcon,
} from '@mui/icons-material'
import { SxProps, Tooltip } from '@mui/material'
import { useTranslation } from 'next-i18next'
import type { TxStatus } from 'utils'

const TxStatusIcon: React.FC<{ status: TxStatus; isSuccess?: boolean }> = ({ status, isSuccess = false }) => {
  const [t] = useTranslation('common')
  const properties: { sx: SxProps; color: 'success' | 'warning' } = {
    sx: { fontSize: 16, mr: 1 },
    color: isSuccess ? 'success' : 'warning',
  }
  if (!isSuccess) {
    return <ErrorIcon {...properties} color="warning" />
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
        <CommittedIcon {...properties} />
      </Tooltip>
    )
  }
  if (status === 'finalized') {
    return (
      <Tooltip title={t(status)} placement="top">
        <FinalizedIcon {...properties} />
      </Tooltip>
    )
  }
  return <ErrorIcon {...properties} color="warning" />
}

export default TxStatusIcon
