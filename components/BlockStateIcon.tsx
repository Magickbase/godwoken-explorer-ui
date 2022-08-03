import { HelpOutlineOutlined as HelpIcon } from '@mui/icons-material'
import { Box, SxProps, Tooltip } from '@mui/material'
import { useTranslation } from 'next-i18next'
import type { BlockState, GraphQLSchema } from 'utils'
import CommittedIcon from 'assets/icons/committed.svg'
import FinalizedIcon from 'assets/icons/finalized.svg'
import PendingIcon from 'assets/icons/pending.svg'

const BlockStateIcon: React.FC<{ state: BlockState | GraphQLSchema.BlockStatus }> = ({ state }) => {
  const [t] = useTranslation('common')
  const properties: { sx: SxProps } = {
    sx: { fontSize: 16, display: 'flex' },
  }

  if (state.toLowerCase() === 'committed') {
    return (
      <Tooltip title={t(state)} placement="top">
        <Box {...properties}>
          <CommittedIcon />
        </Box>
      </Tooltip>
    )
  }
  if (state.toLowerCase() === 'finalized') {
    return (
      <Tooltip title={t(state)} placement="top">
        <Box {...properties}>
          <FinalizedIcon {...properties} />
        </Box>
      </Tooltip>
    )
  }
  if (state.toLowerCase() === 'pending') {
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
