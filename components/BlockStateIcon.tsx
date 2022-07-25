import { HelpOutlineOutlined as HelpIcon } from '@mui/icons-material'
import { Box, SxProps, Tooltip } from '@mui/material'
import { useTranslation } from 'next-i18next'
import type { BlockState } from 'utils'
import CommittedIcon from 'assets/icons/committed.svg'
import FinalizedIcon from 'assets/icons/finalized.svg'
import PendingIcon from 'assets/icons/pending.svg'

const BlockStateIcon: React.FC<{ state: BlockState }> = ({ state }) => {
  const [t] = useTranslation('common')
  const properties: { sx: SxProps } = {
    sx: { fontSize: 16, ml: { xs: 0.4, md: 1 }, display: 'flex' },
  }

  if (state === 'committed') {
    return (
      <Tooltip title={t(state)} placement="top">
        <Box {...properties}>
          <CommittedIcon />
        </Box>
      </Tooltip>
    )
  }
  if (state === 'finalized') {
    return (
      <Tooltip title={t(state)} placement="top">
        <Box {...properties}>
          <FinalizedIcon {...properties} />
        </Box>
      </Tooltip>
    )
  }
  if (state === 'pending') {
    return (
      <Tooltip title={t(state)} placement="top">
        <Box {...properties}>
          <PendingIcon {...properties} />
        </Box>
      </Tooltip>
    )
  }

  return <HelpIcon {...properties} color="warning" />
}

export default BlockStateIcon
