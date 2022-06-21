import NextLink from 'next/link'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import { CKB_EXPLORER_URL, EXPLORER_TITLE, IMG_URL, NERVINA_GITHUB_URL, NERVOS_URL } from 'utils'
import { Fragment } from 'react'
import Logo from './Logo'

const links = [
  { label: 'Nervos', url: NERVOS_URL },
  { label: 'GitHub', url: NERVINA_GITHUB_URL },
  { label: 'CKB Explorer', url: CKB_EXPLORER_URL },
]
const Footer = () => {
  return (
    <Box component="footer" sx={{ width: '100%', bgcolor: 'primary.dark', display: 'flex', justifyContent: 'center' }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignContent="center"
        sx={{
          height: 'var(--footer-height)',
          width: '100%',
          color: 'white',
          flexDirection: { xs: 'column', md: 'row' },
          pt: 1.5,
          maxWidth: 1200,
        }}
      >
        <Box sx={{ width: '100%', display: { xs: 'block', md: 'none' }, py: 1 }}>
          <NextLink href="/" passHref>
            <Link
              href="/"
              title={EXPLORER_TITLE}
              underline="none"
              display="flex"
              sx={{
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Logo sx={{ color: '#fff' }} id="logo" />
            </Link>
          </NextLink>
        </Box>
        <Box
          sx={{
            flex: '1 0 auto',
            display: { xs: 'block', md: 'flex' },
            flexDirection: 'column',
            justifyContent: { xs: 'space-around', md: 'space-evenly' },
          }}
        >
          <Box
            id="footer-links"
            component="div"
            sx={{
              display: 'flex',
              height: '55px',
              justifyContent: { xs: 'center', md: 'left' },
              alignItems: 'center',
              pl: 3,
              my: 2,
            }}
          >
            {links.map((link, i) => (
              <Fragment key={link.label}>
                <NextLink href={link.url} passHref>
                  <Button
                    href={link.url}
                    title={link.label}
                    color="inherit"
                    component={Link}
                    sx={{ textTransform: 'none', fontWeight: 400 }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </Button>
                </NextLink>
                {i !== links.length - 1 && (
                  <Divider
                    sx={{
                      display: { xs: 'block', md: 'none' },
                      ml: 2.8,
                      mr: i === links.length - 2 ? 1.5 : 2.5,
                      height: '12px',
                      alignSelf: 'center',
                      opacity: 0.5,
                    }}
                    orientation="vertical"
                    color="#fff"
                    flexItem
                  />
                )}
              </Fragment>
            ))}
          </Box>
          <Divider sx={{ display: { xs: 'block', md: 'none', backgroundColor: '#f0f0f0', opacity: 0.1 } }} />
          <Typography
            variant="body2"
            color="#fff"
            id="footer-copy-right"
            sx={{
              textAlign: { xs: 'center', md: 'left' },
              fontSize: { xs: 12 },
              pl: { xs: 1, md: 4 },
              mt: 1,
              opacity: 0.5,
            }}
          >
            Copyright &copy; 2022 Nervina Labs All Rights Reserved.
          </Typography>
        </Box>
        <Box
          sx={{ width: '100%', display: { xs: 'none', md: 'flex' }, flex: '0 0 150px', alignItems: 'flex-end', mb: 4 }}
        >
          <NextLink href="/" passHref>
            <Link
              href="/"
              title={EXPLORER_TITLE}
              underline="none"
              display="flex"
              sx={{
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Logo sx={{ color: '#fff' }} id="logo" />
            </Link>
          </NextLink>
        </Box>
      </Box>
    </Box>
  )
}

export default Footer
