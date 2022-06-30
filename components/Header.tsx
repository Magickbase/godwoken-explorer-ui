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
  styled,
  alpha,
} from '@mui/material'
import { Search as SearchIcon, Translate as TranslateIcon, MoreVert as MoreIcon } from '@mui/icons-material'
import { EXPLORER_TITLE, IMG_URL, SEARCH_FIELDS, handleSearchKeyPress, fetchVersion } from 'utils'

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
const LOCALE_LIST = ['zh-CN', 'en-US']

const Header = () => {
  const [t, { language }] = useTranslation('common')
  const [version, setVersion] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const anchorElLabel = anchorEl?.getAttribute('aria-label')
  const {
    push,
    query: { search: searchInQuery },
    asPath,
  } = useRouter()
  const searchRef = useRef<HTMLInputElement | null>(null)

  const CHAIN_TYPE_LIST = ['mainnet', 'testnet']

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleSearchKeyPress(e, push)
  }

  const handleMenuListOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }
  const handleMenuListClose = () => setAnchorEl(null)

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

  useEffect(() => {
    fetchVersion()
      .then(versions => {
        setVersion(versions.godwokenVersion?.split(' ')[0])
      })
      .catch(() => {
        /* ignore */
      })
  }, [setVersion])

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
        <NextLink href={`/contracts`}>
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
        <NextLink href={`/charts`}>
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
            <NextLink href={url}>
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
          <NextLink href="/">
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
              {version ? (
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
                  {`V${version}`}
                </Typography>
              ) : null}
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
