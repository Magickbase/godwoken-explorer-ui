import NextLink from 'next/link'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import { CKB_EXPLORER_URL, EXPLORER_TITLE, NERVINA_GITHUB_URL, NERVOS_URL, IS_MAINNET } from 'utils'
import { Fragment } from 'react'
import Logo from './Logo'

const BRIDGE_URL = IS_MAINNET ? 'https://bridge.godwoken.io/#/v1' : 'https://testnet.bridge.godwoken.io/#/v1'

const links = [
  { label: 'Nervos', url: NERVOS_URL },
  { label: 'GitHub', url: NERVINA_GITHUB_URL },
  { label: 'CKB Explorer', url: CKB_EXPLORER_URL },
  { label: 'Bridge', url: BRIDGE_URL },
]

const StyledFooter = styled(Box)`
  display: flex;
  justify-content: center;
  height: var(--footer-height);
  width: 100%;
  #footer-container {
    display: grid;
    gap: 0;
    padding-top: 20px;
    padding-bottom: 20px;
    grid-auto-rows: 80px;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'links     empty'
      'copyright logo';
  }
  #footer-links {
    grid-area: links;
    margin-top: 16px;
    justify-self: left;
    align-self: center;
  }
  #footer-copy-right {
    grid-area: copyright;
    justify-self: left;
    align-self: center;
  }
  #footer-logo {
    grid-area: logo;
    justify-self: right;
    align-self: center;
  }
  #footer-divider {
    display: none;
  }

  @media (max-width: 900px) {
    #footer-container {
      padding-top: 14px;
      grid-template-rows: 40px 85px 1px 66px;
      grid-template-columns: 1fr;
      grid-template-areas:
        'logo'
        'links'
        'divider'
        'copyright';
    }
    #footer-logo {
      grid-area: logo;
      justify-self: center;
      align-self: center;
    }
    #footer-links {
      grid-area: links;
      margin-top: 0;
      justify-self: center;
      align-self: center;
      a {
        font-size: 12px;
      }
    }
    #footer-divider {
      display: block;
      grid-area: divider;
      justify-self: center;
    }
    #footer-copy-right {
      grid-area: copyright;
      justify-self: center;
      align-self: start;
      margin-top: 14px;
    }
  }
`

const Footer = () => {
  return (
    <StyledFooter component="footer" sx={{ width: '100%', bgcolor: 'primary.dark' }}>
      <Box
        id="footer-container"
        sx={{
          height: 'var(--footer-height)',
          width: '100%',
          maxWidth: 1200,
          color: 'white',
        }}
      >
        <Box id="footer-logo">
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
                pr: { xs: 0, md: 3, lg: 1 },
              }}
            >
              <Logo sx={{ color: '#fff' }} id="logo" />
            </Link>
          </NextLink>
        </Box>
        <Box
          id="footer-links"
          component="div"
          sx={{
            display: 'flex',
            height: '55px',
            justifyContent: { xs: 'center', md: 'left' },
            alignItems: 'center',
            pl: { xs: 0, md: 2, lg: 0 },
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
                    mx: 1.4,
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
        <Divider id="footer-divider" sx={{ backgroundColor: '#f0f0f0', opacity: 0.1, height: '1px', width: '100%' }} />
        <Typography
          id="footer-copy-right"
          variant="body2"
          color="#fff"
          sx={{
            textAlign: { xs: 'center', md: 'left' },
            fontSize: { xs: 12 },
            pl: { xs: 1, md: 3, lg: 1 },
            mt: 1,
            opacity: 0.5,
          }}
        >
          Copyright &copy; 2024 Magickbase All Rights Reserved.
        </Typography>
      </Box>
    </StyledFooter>
  )
}

export default Footer
