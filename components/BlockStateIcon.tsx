import {
  Done as CommittedIcon,
  DoneAllOutlined as FinalizedIcon,
  HelpOutlineOutlined as HelpIcon,
} from '@mui/icons-material'
import { SxProps, Tooltip } from '@mui/material'
import { useTranslation } from 'next-i18next'
import type { BlockState } from 'utils'

const BlockStateIcon: React.FC<{ state: BlockState }> = ({ state }) => {
  const [t] = useTranslation('common')
  const properties: { sx: SxProps } = {
    sx: { fontSize: 16, mr: 1 },
  }

  if (state === 'committed') {
    return (
      <Tooltip title={t(state)} placement="top">
        <CommittedIcon {...properties} />
      </Tooltip>
    )
  }
  if (state === 'finalized') {
    return (
      <Tooltip title={t(state)} placement="top">
        <FinalizedIcon {...properties} />
      </Tooltip>
    )
  }
  return <HelpIcon {...properties} color="warning" />
}

export default BlockStateIcon
