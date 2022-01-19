import {
  HourglassEmptyOutlined as PendingIcon,
  Done as CommittedIcon,
  DoneAllOutlined as FinalizedIcon,
  ErrorOutlineOutlined as ErrorIcon,
} from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import { useTranslation } from 'next-i18next'
import type { TxStatus } from 'utils'

const TxStatusIcon: React.FC<{ status: TxStatus }> = ({ status }) => {
  const [t] = useTranslation('common')
  if (status === 'pending') {
    return (
      <Tooltip title={t(status)} placement="top">
        <PendingIcon sx={{ fontSize: 16, mr: 1 }} />
      </Tooltip>
    )
  }
  if (status === 'committed') {
    return (
      <Tooltip title={t(status)} placement="top">
        <CommittedIcon sx={{ fontSize: 16, mr: 1 }} />
      </Tooltip>
    )
  }
  if (status === 'finalized') {
    return (
      <Tooltip title={t(status)} placement="top">
        <FinalizedIcon sx={{ fontSize: 16, mr: 1 }} />
      </Tooltip>
    )
  }
  return <ErrorIcon color="warning" sx={{ fontSize: 16, mr: 1 }} />
}

export default TxStatusIcon
