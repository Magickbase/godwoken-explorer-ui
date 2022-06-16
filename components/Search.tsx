import { useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { InputBase, IconButton, Divider, alpha, styled } from '@mui/material'
import { Search as SearchIcon, Translate as TranslateIcon, MoreVert as MoreIcon } from '@mui/icons-material'
import { EXPLORER_TITLE, IMG_URL, SEARCH_FIELDS, GW_VERSION, handleSearchKeyPress } from 'utils'

const SearchStyled = styled('div')(({ theme }) => ({
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

const Search = () => {
  const [t, { language }] = useTranslation('common')
  const {
    push,
    query: { search: searchInQuery },
    asPath,
  } = useRouter()
  const searchRef = useRef<HTMLInputElement | null>(null)

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleSearchKeyPress(e, push)
  }

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
    <SearchStyled sx={{ ml: 2 }}>
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
    </SearchStyled>
  )
}

export default Search
