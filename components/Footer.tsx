import NextLink from 'next/link'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { CKB_EXPLORER_URL, EXPLORER_TITLE, IMG_URL, NERVINA_GITHUB_URL, NERVOS_URL } from 'utils'
import { Fragment } from 'react'

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
          py: 1.5,
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
              <Image
                src={`${IMG_URL}nervina-logo-white.svg`}
                loading="lazy"
                width="96"
                height="23"
                layout="fixed"
                alt="logo"
              />
            </Link>
          </NextLink>
        </Box>
        <Stack spacing={0} sx={{ flex: '1 0 auto', justifyContent: { xs: 'space-around', md: 'space-evenly' } }}>
          <Box
            id="footer-links"
            component="div"
            sx={{
              display: 'flex',
              height: '1em',
              justifyContent: { xs: 'center', md: 'left' },
              alignItems: 'center',
              pl: { xs: 4, md: 3 },
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
                    sx={{ textTransform: 'none' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </Button>
                </NextLink>
                {i !== links.length - 1 && (
                  <Divider
                    sx={{ display: { xs: 'block', md: 'none' }, lineHeight: '8px', mx: 2 }}
                    orientation="vertical"
                    color="#999"
                    flexItem
                  />
                )}
              </Fragment>
            ))}
          </Box>
          <Divider sx={{ display: { xs: 'block', md: 'none', backgroundColor: '#4d4d4d' } }} />
          <Typography
            variant="body2"
            color="secondary.light"
            id="footer-copy-right"
            sx={{ textAlign: { xs: 'center', md: 'left' }, pl: 4, mt: 1 }}
          >
            Copyright &copy; 2022 Nervina Labs All Rights Reserved.
          </Typography>
        </Stack>
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
              <Image
                src={`${IMG_URL}nervina-logo-white.svg`}
                loading="lazy"
                width="96"
                height="23"
                layout="fixed"
                alt="logo"
              />
            </Link>
          </NextLink>
        </Box>
      </Box>
    </Box>
  )
}

export default Footer
