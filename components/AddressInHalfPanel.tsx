import NextLink from 'next/link'
import { Typography, Link } from '@mui/material'
import Address from 'components/TruncatedAddress'
const AddressInHalfPanel = ({ address, alias }: { address: string; alias?: string }) => {
  const text = alias || address
  return (
    <Typography variant="body2" component="div">
      <NextLink href={`/account/${address}`}>
        <Link
          href={`/account/${address}`}
          underline="none"
          className="mono-font"
          color="secondary"
          sx={{ display: text.length >= 32 ? { xs: 'none', sm: 'flex' } : 'flex' }}
        >
          {text}
        </Link>
      </NextLink>
      <Address
        address={text}
        sx={{ display: text.length >= 32 ? { xs: 'inline', sm: 'none' } : 'none' }}
        size="normal"
        leading={15}
      />
    </Typography>
  )
}

export default AddressInHalfPanel
