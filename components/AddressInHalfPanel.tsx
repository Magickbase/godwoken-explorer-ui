import NextLink from 'next/link'
import { Typography, Link } from '@mui/material'
import Address from 'components/TruncatedAddress'
const AddressInHalfPanel = ({ address }: { address: string }) => (
  <Typography variant="body2">
    <NextLink href={`/account/${address}`}>
      <Link
        href={`/account/${address}`}
        underline="none"
        className="mono-font"
        color="secondary"
        sx={{ display: address.length >= 32 ? { xs: 'none', sm: 'flex' } : null }}
      >
        {address}
      </Link>
    </NextLink>
    <Address
      address={address}
      sx={{ display: address.length >= 32 ? { xs: 'inline', sm: 'none' } : null }}
      size="normal"
      leading={15}
    />
  </Typography>
)

export default AddressInHalfPanel
