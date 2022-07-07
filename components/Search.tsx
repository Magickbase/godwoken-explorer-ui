import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { InputBase, InputAdornment, styled } from '@mui/material'
import { IMG_URL, SEARCH_FIELDS, handleSearchKeyPress } from 'utils'
import Image from 'next/image'

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  '& .Mui-focused': {
    // border: `1px solid red`,
    border: `1px solid ${theme.palette.primary.main} !important`,
  },
  '&:focus': {},
  'width': '100%',
  'height': '56px',
  'padding': theme.spacing(1, 2),
  'marginTop': theme.spacing(2),
  'borderRadius': '16px',
  'color': 'secondary.light',
  'backgroundColor': '#ffffff',
  'fontWeight': 500,
  [theme.breakpoints.down('sm')]: {
    height: 40,
    borderRadius: '8px',
    padding: theme.spacing(1),
  },
  '& .MuiInputBase-input': {
    height: '100%',
    paddingLeft: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
    },
  },
}))

const Search = () => {
  const [t] = useTranslation('common')
  const {
    push,
    query: { search: searchInQuery },
    asPath,
  } = useRouter()
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [showClearBtn, setShowClearBtn] = useState(false)

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    await handleSearchKeyPress(e, push)
  }

  const handleChange = () => {
    if (searchRef.current?.value?.length === 0) {
      setShowClearBtn(false)
    } else {
      setShowClearBtn(true)
    }
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
    <StyledInputBase
      placeholder={SEARCH_FIELDS}
      title={SEARCH_FIELDS}
      onKeyPress={handleSearch}
      onChange={handleChange}
      inputRef={searchRef}
      sx={{ fontSize: { xs: 12, md: 14 } }}
      inputProps={{ 'aria-label': 'search' }}
      startAdornment={
        <InputAdornment position="end" sx={{ width: 20, height: 20, ml: 0 }}>
          <Image
            src={`${IMG_URL}search-icon.svg`}
            loading="lazy"
            width="20"
            height="20"
            layout="fixed"
            alt="search-icon"
          />
        </InputAdornment>
      }
      endAdornment={
        <InputAdornment
          position="end"
          sx={{ width: 20, height: 20, display: showClearBtn ? 'inline' : 'none', cursor: 'pointer' }}
          onClick={() => {
            searchRef.current.value = ''
            setShowClearBtn(false)
          }}
        >
          <Image
            src={`${IMG_URL}search-clear.svg`}
            loading="lazy"
            width="20"
            height="20"
            layout="fixed"
            alt="search-icon"
          />
        </InputAdornment>
      }
    />
  )
}

export default Search
