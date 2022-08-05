import { Box, SxProps } from '@mui/material'
import Tooltip from 'components/Tooltip'
import HashLink from './HashLink'
import { GraphQLSchema } from 'utils'
const TruncatedAddress = ({
  address,
  leading = 8,
  sx = {},
  type,
}: {
  address: string
  leading?: number
  sx?: SxProps
  type?: GraphQLSchema.AccountType
}) => (
  <Tooltip title={address} placement="top" sx={sx}>
    <Box sx={sx}>
      <HashLink
        label={
          [
            GraphQLSchema.AccountType.EthAddrReg,
            GraphQLSchema.AccountType.MetaContract,
            GraphQLSchema.AccountType.PolyjuiceCreator,
          ].includes(type)
            ? type.replace(/_/g, ' ').toLowerCase()
            : address.length > leading * 2
            ? `${address.slice(0, leading)}...${address.slice(-leading)}`
            : address
        }
        href={`/account/${address}`}
      />
    </Box>
  </Tooltip>
)

export default TruncatedAddress
