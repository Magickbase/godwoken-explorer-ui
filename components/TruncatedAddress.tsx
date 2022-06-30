import NextLink from 'next/link'
import { Tooltip, Box, Link, SxProps } from '@mui/material'
import { GraphQLSchema } from 'utils'
const TruncatedAddress = ({
  address,
  leading = 8,
  size = 'small',
  sx = {},
  type,
}: {
  address: string
  leading?: number
  size?: 'normal' | 'small'
  sx?: SxProps
  type?: GraphQLSchema.AccountType
}) => (
  <Tooltip title={address} placement="top" sx={sx}>
    <Box fontSize={size === 'small' ? 12 : 14}>
      <NextLink href={`/account/${address}`}>
        <Link href={`/account/${address}`} underline="none" color="secondary" className="mono-font" whiteSpace="nowrap">
          {[
            GraphQLSchema.AccountType.EthAddrReg,
            GraphQLSchema.AccountType.MetaContract,
            GraphQLSchema.AccountType.PolyjuiceCreator,
          ].includes(type)
            ? type.replace(/_/g, ' ')
            : address.length > leading * 2
            ? `${address.slice(0, leading)}...${address.slice(-leading)}`
            : address}
        </Link>
      </NextLink>
    </Box>
  </Tooltip>
)

export default TruncatedAddress
