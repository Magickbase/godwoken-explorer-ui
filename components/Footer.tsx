import NextLink from 'next/link'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { CKB_EXPLORER_URL, NERVINA_GITHUB_URL, NERVOS_URL, IS_MAINNET } from 'utils'
import Button from '@mui/material/Button'

const BRIDGE_URL = IS_MAINNET ? 'https://bridge.godwoken.io/#/v1' : 'https://testnet.bridge.godwoken.io/#/v1'

const links = [
  { label: 'Nervos', url: NERVOS_URL },
  { label: 'GitHub', url: NERVINA_GITHUB_URL },
  { label: 'CKB Explorer', url: CKB_EXPLORER_URL },
]

if (IS_MAINNET) {
  links.push({ label: 'Bridge', url: BRIDGE_URL })
}

const Footer = () => (
  <Box
    component="footer"
    display="flex"
    flexDirection="column"
    justifyContent="space-evenly"
    sx={{ bgcolor: 'primary.dark', height: 'var(--footer-height)', color: 'white' }}
  >
    <Box component="div" textAlign="center">
      {links.map(link => (
        <NextLink href={link.url} key={link.label}>
          <Button
            href={link.url}
            title={link.label}
            color="inherit"
            component={Link}
            sx={{ textTransform: 'none' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.label}
          </Button>
        </NextLink>
      ))}
    </Box>
    <Typography variant="body2" marginX="auto">
      Copyright &copy; 2022 Nervina Labs All Rights Reserved.
    </Typography>
  </Box>
)
export default Footer
