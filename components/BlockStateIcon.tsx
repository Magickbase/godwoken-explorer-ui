import { HelpOutlineOutlined as HelpIcon } from '@mui/icons-material'
import { useTranslation } from 'next-i18next'
import type { BlockState, GraphQLSchema } from 'utils'
import Tooltip from 'components/Tooltip'
import CommittedIcon from 'assets/icons/committed.svg'
import FinalizedIcon from 'assets/icons/finalized.svg'
import PendingIcon from 'assets/icons/pending.svg'

const BlockStateIcon: React.FC<{ state: BlockState | GraphQLSchema.BlockStatus }> = ({ state }) => {
  const [t] = useTranslation('common')
  // const properties = { fontSize: 16, display: 'flex' }
  const properties = { display: 'flex', alignItems: 'center', flexShrink: 0 }
  const stateLowercase = state.toLowerCase()

  if (stateLowercase === 'committed') {
    return (
      <Tooltip title={t(stateLowercase)} placement="top">
        <div style={{ ...properties }}>
          <CommittedIcon />
        </div>
      </Tooltip>
    )
  }
  if (stateLowercase === 'finalized') {
    return (
      <Tooltip title={t(stateLowercase)} placement="top">
        <div style={{ ...properties }}>
          <FinalizedIcon {...properties} />
        </div>
      </Tooltip>
    )
  }
  if (stateLowercase === 'pending') {
    return (
      <Tooltip title={t(stateLowercase)} placement="top">
        <div style={{ ...properties }}>
          <PendingIcon {...properties} />
        </div>
      </Tooltip>
    )
  }

  return <HelpIcon sx={{ ...properties }} color="warning" />
}

export default BlockStateIcon
