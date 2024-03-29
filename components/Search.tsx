import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { OutlinedInput, InputAdornment, styled, InputBaseProps } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IMG_URL, SEARCH_FIELDS, handleSearchKeyPress } from 'utils'

// TODO: use search button in virtual keyboard
const StyledInputBase = styled((props: InputBaseProps) => <OutlinedInput {...props} />)(({ theme }) => ({
  'width': '100%',
  'height': '56px',
  'padding': theme.spacing(1, 2),
  'marginTop': theme.spacing(2),
  'borderRadius': '16px',
  'color': theme.palette.secondary.main,
  'backgroundColor': '#ffffff',
  'fontWeight': 500,
  [theme.breakpoints.down('sm')]: {
    height: 40,
    borderRadius: '8px',
    padding: theme.spacing(1),
  },
  [theme.breakpoints.up('sm')]: {
    marginTop: theme.spacing(3),
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
  const { push, asPath, query } = useRouter()
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [showClearBtn, setShowClearBtn] = useState(false)
  const isHome = asPath === '/' || asPath === '/zh-CN'
  const theme = useTheme()

  useEffect(() => {
    if (!searchRef.current) return
    if (query.search) {
      searchRef.current.value = (query.search as string) || ''
    } else {
      // on page refresh, next.js's query.search will always be null, so need this fallback
      const queryValue = new URLSearchParams(window.location.search).get('search')
      if (queryValue) {
        searchRef.current.value = queryValue || ''
      }
    }
    if (searchRef.current.value) {
      setShowClearBtn(true)
    }
  }, [query, asPath])

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    await handleSearchKeyPress(e, push)
    if (e.key === 'Enter') {
      searchRef.current?.blur()
      setShowClearBtn(false)
    }
  }

  const handleChange = () => {
    if (searchRef.current?.value?.length === 0) {
      setShowClearBtn(false)
    } else {
      setShowClearBtn(true)
    }
  }

  return (
    <StyledInputBase
      autoFocus
      placeholder={SEARCH_FIELDS}
      title={SEARCH_FIELDS}
      onKeyPress={handleSearch}
      onChange={handleChange}
      inputRef={searchRef}
      inputMode="search"
      className="search-input"
      // name="search"
      // type="search" //FIXME: search type introduce a default clear btn, should be fixed
      // id="search"
      sx={{
        'fontSize': { xs: 12, md: 14 },
        '& .MuiOutlinedInput-notchedOutline': {
          borderWidth: '0.5px',
          borderColor: isHome ? 'white !important' : '#f0f0f0 !important',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderWidth: '1px',
          borderColor: `${theme.palette.primary.main} !important`,
        },
      }}
      inputProps={{ 'aria-label': 'search', 'maxLength': 100 }}
      startAdornment={
        <InputAdornment position="end" sx={{ width: 20, height: 20, ml: 0 }}>
          <Image
            src={`${IMG_URL}search-icon.svg`}
            loading="lazy"
            width="16"
            height="16"
            layout="fixed"
            alt="search-icon"
          />
        </InputAdornment>
      }
      endAdornment={
        <InputAdornment
          position="end"
          sx={{ width: 20, height: 20, display: showClearBtn ? 'inline-flex' : 'none', cursor: 'pointer' }}
          onClick={() => {
            searchRef.current.value = ''
            setShowClearBtn(false)
          }}
        >
          <Image
            src={`${IMG_URL}search-clear.svg`}
            loading="lazy"
            width="16"
            height="16"
            layout="fixed"
            alt="search-clear"
          />
        </InputAdornment>
      }
    />
  )
}

export default Search
