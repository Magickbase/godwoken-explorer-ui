import { useState, useRef, useEffect } from 'react'
import NextLink from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import InputBase from '@mui/material/InputBase'
import { styled, alpha } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import SearchIcon from '@mui/icons-material/Search'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Container from '@mui/material/Container'
import { EXPLORER_TITLE, fetchSearch, IMG_URL, SEARCH_FIELDS, handleSearchKeyPress } from 'utils'

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

export default () => {
  const [t] = useTranslation('common')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const {
    push,
    query: { search: searchInQuery },
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

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'primary.dark' }}>
      <Container>
        <Toolbar sx={{ flexGrow: 1 }}>
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
              <Typography
                sx={{ mx: 2, display: { xs: 'none', sm: 'flex' }, fontSize: { sm: 16, md: 24 } }}
                variant="h5"
                noWrap
              >
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
          <Button
            aria-controls={anchorEl ? 'token-list' : undefined}
            aria-haspopup="true"
            aria-expanded={anchorEl ? 'true' : undefined}
            onClick={handleTokenListOpen}
            color="inherit"
            disableRipple
          >
            {t(`token`)}
          </Button>
          <Menu
            id="token-list"
            anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={handleTokenListClose}
            MenuListProps={{ 'aria-labelledby': 'token-item' }}
          >
            {['bridge', 'native'].map(type => (
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
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
