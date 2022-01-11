import { useState, useRef, useEffect } from 'react'
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
  InputBase,
  IconButton,
  Divider,
  ListSubheader,
  styled,
  alpha,
} from '@mui/material'
import { Search as SearchIcon, Translate as TranslateIcon, MoreVert as MoreIcon } from '@mui/icons-material'
import { EXPLORER_TITLE, IMG_URL, SEARCH_FIELDS, handleSearchKeyPress } from 'utils'

const Search = styled('div')(({ theme }) => ({
  'position': 'relative',
  'borderRadius': theme.shape.borderRadius,
  'backgroundColor': alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  'width': '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}))

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  'color': 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      'width': '25ch',
      '&:focus': {
        width: '30ch',
      },
    },
    [theme.breakpoints.up('md')]: {
      'width': '30ch',
      '&:focus': {
        width: '40ch',
      },
    },
    [theme.breakpoints.up('lg')]: {
      'width': '40ch',
      '&:focus': {
        width: '66ch',
      },
    },
  },
}))

const TOKEN_TYPE_LIST = ['bridge', 'native']
const CHAIN_TYPE_LIST = ['mainnet', 'testnet']
const LOCALE_LIST = ['zh-CN', 'en-US']

export default () => {
  const [t, { language }] = useTranslation('common')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const anchorElLabel = anchorEl?.getAttribute('aria-label')
  const {
    push,
    query: { search: searchInQuery },
    asPath,
  } = useRouter()
  const searchRef = useRef<HTMLInputElement | null>(null)

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleSearchKeyPress(e, push)
  }

  const handleTokenListOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }
  const handleTokenListClose = () => setAnchorEl(null)

  useEffect(() => {
    if (searchRef.current && typeof searchInQuery === 'string' && searchInQuery) {
      searchRef.current.value = searchInQuery
    }
    return () => {
      if (searchRef.current) {
        searchRef.current.value = ''
      }
    }
  }, [searchInQuery, searchRef])

  const tokenMenuItems = (
    <>
      {TOKEN_TYPE_LIST.map(type => (
        <MenuItem key={type} onClick={handleTokenListClose} sx={{ p: 0 }}>
          <NextLink href={`/tokens/${type}`}>
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
    </>
  )

  const chainMenuItems = (
    <>
      {CHAIN_TYPE_LIST.map(chain => {
        const url = `https://${
          chain === 'mainnet'
            ? process.env.NEXT_PUBLIC_MAINNET_EXPLORER_HOSTNAME
            : process.env.NEXT_PUBLIC_TESTNET_EXPLORER_HOSTNAME
        }/${language}`
        return (
          <MenuItem key={chain} onClick={handleTokenListClose} sx={{ p: 0 }}>
            <NextLink href={url}>
              <Link href={url} title={t(chain)} underline="none" sx={{ width: '100%', padding: '6px 16px' }}>
                {t(chain)}
              </Link>
            </NextLink>
          </MenuItem>
        )
      })}
    </>
  )

  const localeMenuItems = (
    <>
      {LOCALE_LIST.map(locale => (
        <MenuItem key={locale} onClick={handleTokenListClose} sx={{ p: 0 }}>
          <NextLink href={asPath} locale={locale} passHref>
            <Link title={t(locale)} underline="none" sx={{ width: '100%', padding: '6px 16px' }}>
              {t(locale)}
            </Link>
          </NextLink>
        </MenuItem>
      ))}
    </>
  )

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'primary.dark' }}>
      <Container>
        <Toolbar sx={{ flexGrow: 1 }} disableGutters>
          <NextLink href="/">
            <Link
              href="/"
              title={EXPLORER_TITLE}
              color="#fff"
              underline="none"
              mr="auto"
              display="flex"
              alignItems="center"
            >
              <Image
                src={`${IMG_URL}nervina-logo.svg`}
                loading="lazy"
                width="31"
                height="20"
                layout="fixed"
                alt="logo"
              />
              <Typography sx={{ mx: 2, display: { xs: 'none', sm: 'flex' } }} variant="h5" noWrap>
                {EXPLORER_TITLE}
              </Typography>
            </Link>
          </NextLink>

          <Search sx={{ ml: 2 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder={SEARCH_FIELDS}
              autoFocus
              title={SEARCH_FIELDS}
              inputProps={{ 'aria-label': 'search' }}
              onKeyPress={handleSearch}
              inputRef={searchRef}
            />
          </Search>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button
              aria-label="token-list"
              aria-haspopup="true"
              aria-expanded={anchorElLabel === 'token-list' ? 'true' : undefined}
              aria-controls={anchorElLabel === 'token-list' ? 'token-list' : undefined}
              onClick={handleTokenListOpen}
              color="inherit"
              disableRipple
            >
              {t(`token`)}
            </Button>
            <Menu
              id="token-list"
              anchorEl={anchorEl}
              open={anchorElLabel === 'token-list'}
              onClose={handleTokenListClose}
              MenuListProps={{ 'aria-labelledby': 'token-item' }}
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              {tokenMenuItems}
            </Menu>
            <Button
              aria-label="chain-type"
              aria-haspopup="true"
              aria-expanded={anchorElLabel === 'chain-type' ? 'true' : undefined}
              aria-controls={anchorElLabel === 'chain-type' ? 'chain-type' : undefined}
              onClick={handleTokenListOpen}
              color="inherit"
              disableRipple
            >
              {t(process.env.NEXT_PUBLIC_CHAIN_TYPE || CHAIN_TYPE_LIST[1])}
            </Button>
            <Menu
              id="chain-type"
              anchorEl={anchorEl}
              open={anchorElLabel === 'chain-type'}
              onClose={handleTokenListClose}
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
              onClick={handleTokenListOpen}
              color="inherit"
              disableRipple
            >
              <TranslateIcon fontSize="small" />
            </IconButton>
            <Menu
              id="i18n"
              anchorEl={anchorEl}
              open={anchorElLabel === 'i18n'}
              onClose={handleTokenListClose}
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
              onClick={handleTokenListOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
            <Menu
              id="mobile-menu"
              anchorEl={anchorEl}
              open={anchorElLabel === 'mobile-menu'}
              onClose={handleTokenListClose}
              MenuListProps={{ 'aria-labelledby': 'mobile-menu' }}
              sx={{ textTransform: 'capitalize', display: { xs: 'block', md: 'none' } }}
            >
              <MenuList dense>
                <Typography variant="subtitle2" textAlign="center">
                  {t(`token`)}
                </Typography>
                {tokenMenuItems}
                <Divider />
                <Typography variant="subtitle2" textAlign="center">
                  {t(`chainType`)}
                </Typography>
                {chainMenuItems}
                <Divider />
                <Typography variant="subtitle2" textAlign="center">
                  {t(`language`)}
                </Typography>
                {localeMenuItems}
              </MenuList>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
