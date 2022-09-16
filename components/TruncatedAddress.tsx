import { Box, SxProps } from '@mui/material'
import Tooltip from 'components/Tooltip'
import HashLink from './HashLink'
import { GraphQLSchema, ZERO_ADDRESS } from 'utils'

const TruncatedAddress = ({
  address,
  leading = 8,
  ellipsisPosition = 'middle',
  sx = {},
  type,
  monoFont = true,
}: {
  address: string
  leading?: number
  ellipsisPosition?: 'middle' | 'end'
  sx?: SxProps
  type?: GraphQLSchema.AccountType
  monoFont?: boolean
}) => {
  if (address === ZERO_ADDRESS) {
    return (
      <Tooltip title={address} placement="top" sx={sx}>
        <Box sx={sx}>
          <span className="mono-font" style={{ color: 'var(--primary-text-color)', userSelect: 'none' }}>
            zero address
          </span>
        </Box>
      </Tooltip>
    )
  }
  const getDisplayText = (type, address: string) => {
    if (
      [
        GraphQLSchema.AccountType.EthAddrReg,
        GraphQLSchema.AccountType.MetaContract,
        GraphQLSchema.AccountType.PolyjuiceCreator,
      ].includes(type)
    ) {
      return type.replace(/_/g, ' ').toLowerCase()
    } else if (address.length > leading * 2) {
      if (ellipsisPosition === 'middle') {
        return `${address.slice(0, leading)}...${address.slice(-leading)}`
      } else {
        return `${address.slice(0, leading)}...`
      }
    } else {
      return address
    }
  }

  return (
    <Tooltip title={address} placement="top" sx={sx}>
      <Box sx={sx}>
        <HashLink label={getDisplayText(type, address)} href={`/account/${address}`} monoFont={monoFont} />
      </Box>
    </Tooltip>
  )
}

export default TruncatedAddress
