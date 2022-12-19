import { Box, SxProps } from '@mui/material'
import Tooltip from 'components/Tooltip'
import AddressWithDomain from 'components/AddressWithDomain'
import HashLink from './HashLink'
import { getAddressDisplay, GraphQLSchema, ZERO_ADDRESS } from 'utils'

const TruncatedAddress = ({
  address,
  leading = 8,
  ellipsisPosition = 'middle',
  sx = {},
  type,
  monoFont = true,
  showDomain = false,
  domain = '',
}: {
  address: string
  leading?: number
  ellipsisPosition?: 'middle' | 'end'
  sx?: SxProps
  type?: GraphQLSchema.AccountType
  monoFont?: boolean
  showDomain?: boolean
  domain?: string
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

  const addrDisplay = getAddressDisplay({
    eth_address: address,
    script_hash: address,
    type,
    smart_contract: null,
  })

  let label = addrDisplay.label

  if (label.startsWith('0x') && label.length > leading * 2) {
    if (ellipsisPosition === 'middle') {
      label = `${label.slice(0, leading)}...${label.slice(-leading)}`
    } else {
      label = `${label.slice(0, leading)}...`
    }
  }

  return (
    <>
      {showDomain ? (
        <Box sx={sx}>
          <AddressWithDomain domain={domain} hash={address} href={`/account/${address}`} />
        </Box>
      ) : (
        <Tooltip title={address} placement="top" sx={sx}>
          <Box sx={sx}>
            <HashLink label={label} href={`/account/${address}`} monoFont={monoFont} />
          </Box>
        </Tooltip>
      )}
    </>
  )
}

export default TruncatedAddress
