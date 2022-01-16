import type { TxStatus } from 'utils'
import {
  HourglassEmptyOutlined as PendingIcon,
  DoneOutlineOutlined as CommittedIcon,
  DoneAllOutlined as FinalizedIcon,
  ErrorOutlineOutlined as ErrorIcon,
} from '@mui/icons-material'

const TxStatus: React.FC<{ status: TxStatus }> = ({ status }) => {
  if (status === 'pending') {
    return <PendingIcon sx={{ fontSize: 16, mr: 1 }} />
  }
  if (status === 'committed') {
    return <CommittedIcon sx={{ fontSize: 16, mr: 1 }} />
  }
  if (status === 'finalized') {
    return <FinalizedIcon sx={{ fontSize: 16, mr: 1 }} />
  }
  return <ErrorIcon color="warning" sx={{ fontSize: 16, mr: 1 }} />
}

export default TxStatus
