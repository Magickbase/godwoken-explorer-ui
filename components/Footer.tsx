import NextLink from 'next/link'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { CKB_EXPLORER_URL, NERVINA_GITHUB_URL, NERVOS_FOUNDATION_URL } from 'utils'
import Button from '@mui/material/Button'

const links = [
  { label: 'Nervos Foundation', url: NERVOS_FOUNDATION_URL },
  { label: 'GitHub', url: NERVINA_GITHUB_URL },
  { label: 'CKB Explorer', url: CKB_EXPLORER_URL },
]
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
          <Button href={link.url} title={link.label} color="inherit" component={Link} sx={{ textTransform: 'none' }}>
            {link.label}
          </Button>
        </NextLink>
      ))}
    </Box>
    <Typography variant="body2" marginX="auto">
      Copyright &copy; 2021 Nervina Labs All Rights Reserved.
    </Typography>
  </Box>
)
export default Footer
