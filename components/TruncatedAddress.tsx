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
  domain,
  placement = 'top',
}: {
  address: string
  leading?: number
  ellipsisPosition?: 'middle' | 'end'
  sx?: SxProps
  type?: GraphQLSchema.AccountType
  monoFont?: boolean
  domain?: string
  placement?: 'top' | 'bottom'
}) => {
  if (address === ZERO_ADDRESS) {
    return (
      <Tooltip title={address} placement={placement} sx={sx}>
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
      {domain ? (
        <Box sx={sx}>
          <AddressWithDomain
            domain={domain}
            hash={address}
            href={`/account/${address}`}
            leading={leading}
            placement={placement}
          />
        </Box>
      ) : (
        <Tooltip title={address} placement={placement} sx={sx}>
          <Box sx={sx}>
            <HashLink label={label} href={`/account/${address}`} monoFont={monoFont} />
          </Box>
        </Tooltip>
      )}
    </>
  )
}

export default TruncatedAddress
