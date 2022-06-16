import { useState, useEffect } from 'react'
import NextLink from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Link,
  Button,
  Menu,
  MenuList,
  MenuItem,
  Typography,
  IconButton,
  Divider,
} from '@mui/material'
import { Translate as TranslateIcon, MoreVert as MoreIcon } from '@mui/icons-material'
import { EXPLORER_TITLE, IMG_URL, GW_VERSION } from 'utils'

const TOKEN_TYPE_LIST = ['bridge', 'native']
const CHAIN_TYPE_LIST = GW_VERSION ? ['testnet'] : ['mainnet', 'testnet']
const LOCALE_LIST = ['zh-CN', 'en-US']

const Header = () => {
  const [t, { language }] = useTranslation('common')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const anchorElLabel = anchorEl?.getAttribute('aria-label')
  const { asPath } = useRouter()

  const handleMenuListOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }
  const handleMenuListClose = () => setAnchorEl(null)

  const contractMenuItems = (
    <MenuList dense>
      <Typography
        variant="subtitle2"
        textAlign="center"
        sx={{ display: { xs: 'block', md: 'none', pointerEvents: 'none' } }}
      >
        {t(`contracts`)}
      </Typography>
      <MenuItem onClick={handleMenuListClose} sx={{ p: 0 }}>
        <NextLink href={`/contracts`} passHref>
          <Link
            href={`/contracts`}
            title={t(`registered_contracts`)}
            underline="none"
            sx={{ width: '100%', padding: '6px 16px' }}
          >
            {t(`registered_contracts`)}
          </Link>
        </NextLink>
      </MenuItem>
    </MenuList>
  )

  const moreMenuItems = (
    <MenuList dense>
      <Typography
        variant="subtitle2"
        textAlign="center"
        sx={{ display: { xs: 'block', md: 'none', pointerEvents: 'none' } }}
      >
        {t(`more`)}
      </Typography>
      <MenuItem onClick={handleMenuListClose} sx={{ p: 0 }}>
        <NextLink href={`/charts`} passHref>
          <Link href={`/charts`} title={t(`charts`)} underline="none" sx={{ width: '100%', padding: '6px 16px' }}>
            {t(`charts`)}
          </Link>
        </NextLink>
      </MenuItem>
    </MenuList>
  )

  const tokenMenuItems = (
    <MenuList dense>
      <Typography
        variant="subtitle2"
        textAlign="center"
        sx={{ display: { xs: 'block', md: 'none', pointerEvents: 'none' } }}
      >
        {t(`token`)}
      </Typography>
      {TOKEN_TYPE_LIST.map(type => (
        <MenuItem key={type} onClick={handleMenuListClose} sx={{ p: 0 }}>
          <NextLink href={`/tokens/${type}`} passHref>
            <Link
              href={`/tokens/${type}`}
              title={t(`${type}-udt`)}
              underline="none"
              sx={{ width: '100%', padding: '6px 16px' }}
            >
              {t(`${type}-udt`)}
            </Link>
          </NextLink>
        </MenuItem>
      ))}
    </MenuList>
  )

  const chainMenuItems = (
    <MenuList dense>
      <Typography
        variant="subtitle2"
        textAlign="center"
        sx={{ display: { xs: 'block', md: 'none', pointerEvents: 'none' } }}
      >
        {t(`chainType`)}
      </Typography>
      {CHAIN_TYPE_LIST.map(chain => {
        const url = `https://${
          chain === 'mainnet'
            ? process.env.NEXT_PUBLIC_MAINNET_EXPLORER_HOSTNAME
            : process.env.NEXT_PUBLIC_TESTNET_EXPLORER_HOSTNAME
        }/${language}`
        return (
          <MenuItem key={chain} onClick={handleMenuListClose} sx={{ p: 0 }}>
            <NextLink href={url} passHref>
              <Link href={url} title={t(chain)} underline="none" sx={{ width: '100%', padding: '6px 16px' }}>
                {t(chain)}
              </Link>
            </NextLink>
          </MenuItem>
        )
      })}
    </MenuList>
  )

  const localeMenuItems = (
    <MenuList dense>
      <Typography
        variant="subtitle2"
        textAlign="center"
        sx={{ display: { xs: 'block', md: 'none' }, pointerEvents: 'none' }}
      >
        {t(`language`)}
      </Typography>
      {LOCALE_LIST.map(locale => (
        <MenuItem key={locale} onClick={handleMenuListClose} sx={{ p: 0 }}>
          <NextLink href={asPath} locale={locale} passHref>
            <Link title={t(locale)} underline="none" sx={{ width: '100%', padding: '6px 16px' }}>
              {t(locale)}
            </Link>
          </NextLink>
        </MenuItem>
      ))}
    </MenuList>
  )

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'primary.dark' }}>
      <Container>
        <Toolbar sx={{ flexGrow: 1 }} disableGutters>
          <NextLink href="/" passHref>
            <Link
              href="/"
              title={EXPLORER_TITLE}
              color="#fff"
              underline="none"
              mr="auto"
              display="flex"
              sx={{
                alignItems: {
                  xs: 'end',
                  sm: 'center',
                },
              }}
            >
              <Image
                src={`${IMG_URL}nervina-logo.svg`}
                loading="lazy"
                width="31"
                height="20"
                layout="fixed"
                alt="logo"
              />
              <Typography sx={{ ml: 2, display: { xs: 'none', sm: 'flex' } }} variant="h5" noWrap>
                {EXPLORER_TITLE}
              </Typography>
              <Typography
                variant="subtitle2"
                letterSpacing={0}
                sx={{
                  lineHeight: '1em',
                  alignSelf: 'flex-end',
                  ml: 0.5,
                  mb: { xs: 0, sm: '6px' },
                  fontVariant: 'unicase',
                  fontStyle: 'italic',
                }}
              >
                {`V${GW_VERSION}`}
              </Typography>
            </Link>
          </NextLink>

          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button
              aria-label="token-list"
              aria-haspopup="true"
              aria-expanded={anchorElLabel === 'token-list' ? 'true' : undefined}
              aria-controls={anchorElLabel === 'token-list' ? 'token-list' : undefined}
              onClick={handleMenuListOpen}
              color="inherit"
              disableRipple
            >
              {t(`token`)}
            </Button>
            <Menu
              id="token-list"
              anchorEl={anchorEl}
              open={anchorElLabel === 'token-list'}
              onClose={handleMenuListClose}
              MenuListProps={{ 'aria-labelledby': 'token-item' }}
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              {tokenMenuItems}
            </Menu>
            <Button
              aria-label="contract-list"
              aria-haspopup="true"
              aria-expanded={anchorElLabel === 'contract-list' ? 'true' : undefined}
              aria-controls={anchorElLabel === 'contract-list' ? 'contract-list' : undefined}
              onClick={handleMenuListOpen}
              color="inherit"
              disableRipple
            >
              {t(`contracts`)}
            </Button>
            <Menu
              id="contract-list"
              anchorEl={anchorEl}
              open={anchorElLabel === 'contract-list'}
              onClose={handleMenuListClose}
              MenuListProps={{ 'aria-labelledby': 'contract-item' }}
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              {contractMenuItems}
            </Menu>
            <Button
              aria-label="more-list"
              aria-haspopup="true"
              aria-expanded={anchorElLabel === 'more-list' ? 'true' : undefined}
              aria-controls={anchorElLabel === 'more-list' ? 'more-list' : undefined}
              onClick={handleMenuListOpen}
              color="inherit"
              disableRipple
            >
              {t(`more`)}
            </Button>
            <Menu
              id="more-list"
              anchorEl={anchorEl}
              open={anchorElLabel === 'more-list'}
              onClose={handleMenuListClose}
              MenuListProps={{ 'aria-labelledby': 'more-item' }}
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              {moreMenuItems}
            </Menu>
            <Button
              aria-label="chain-type"
              aria-haspopup="true"
              aria-expanded={anchorElLabel === 'chain-type' ? 'true' : undefined}
              aria-controls={anchorElLabel === 'chain-type' ? 'chain-type' : undefined}
              onClick={handleMenuListOpen}
              color="inherit"
              disableRipple
            >
              {t(process.env.NEXT_PUBLIC_CHAIN_TYPE || CHAIN_TYPE_LIST[1])}
            </Button>
            <Menu
              id="chain-type"
              anchorEl={anchorEl}
              open={anchorElLabel === 'chain-type'}
              onClose={handleMenuListClose}
              MenuListProps={{ 'aria-labelledby': 'chain-type' }}
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              {chainMenuItems}
            </Menu>
            <IconButton
              aria-label="i18n"
              aria-haspopup="true"
              aria-expanded={anchorElLabel === 'i18n' ? 'true' : undefined}
              aria-controls={anchorElLabel === 'i18n' ? 'i18n' : undefined}
              onClick={handleMenuListOpen}
              color="inherit"
              disableRipple
            >
              <TranslateIcon fontSize="small" />
            </IconButton>
            <Menu
              id="i18n"
              anchorEl={anchorEl}
              open={anchorElLabel === 'i18n'}
              onClose={handleMenuListClose}
              MenuListProps={{ 'aria-labelledby': 'locale' }}
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              {localeMenuItems}
            </Menu>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              aria-label="mobile-menu"
              size="large"
              aria-haspopup="true"
              onClick={handleMenuListOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
            <Menu
              id="mobile-menu"
              anchorEl={anchorEl}
              open={anchorElLabel === 'mobile-menu'}
              onClose={handleMenuListClose}
              MenuListProps={{ 'aria-labelledby': 'mobile-menu' }}
              sx={{ textTransform: 'capitalize', display: { xs: 'block', md: 'none' } }}
              autoFocus={false}
            >
              {tokenMenuItems}
              <Divider />
              {contractMenuItems}
              <Divider />
              {moreMenuItems}
              <Divider />
              {chainMenuItems}
              <Divider />
              {localeMenuItems}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Header
