import NextLink from 'next/link'
import { Tooltip, Box, Link, SxProps } from '@mui/material'
const TruncatedAddress = ({
  address,
  leading = 8,
  size = 'small',
  sx = {},
}: {
  address: string
  leading?: number
  size?: 'normal' | 'small'
  sx?: SxProps
}) => (
  <Tooltip title={address} placement="top" sx={sx}>
    <Box fontSize={size === 'small' ? 12 : 14}>
      <NextLink href={`/account/${address}`}>
        <Link href={`/account/${address}`} underline="none" color="secondary" className="mono-font">
          {address.length > leading * 2 ? `${address.slice(0, leading)}...${address.slice(-leading)}` : address}
        </Link>
      </NextLink>
    </Box>
  </Tooltip>
)

export default TruncatedAddress
