import { HelpOutlineOutlined as HelpIcon } from '@mui/icons-material'
import { useTranslation } from 'next-i18next'
import type { BlockState, GraphQLSchema } from 'utils'
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
      <div className="tooltip" data-tooltip={t(stateLowercase)} style={{ ...properties }}>
        <CommittedIcon />
      </div>
    )
  }
  if (stateLowercase === 'finalized') {
    return (
      <div className="tooltip" data-tooltip={t(stateLowercase)} style={{ ...properties }}>
        <FinalizedIcon {...properties} />
      </div>
    )
  }
  if (stateLowercase === 'pending') {
    return (
      <div className="tooltip" data-tooltip={t(stateLowercase)} style={{ ...properties }}>
        <PendingIcon {...properties} />
      </div>
    )
  }

  return <HelpIcon sx={{ ...properties }} color="warning" />
}

export default BlockStateIcon
