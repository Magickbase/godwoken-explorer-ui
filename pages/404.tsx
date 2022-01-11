import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useRef } from 'react'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Container, Box, TextField, Stack, Typography, Button } from '@mui/material'
import BackIcon from '@mui/icons-material/ArrowBackIosNewOutlined'
import { SEARCH_FIELDS, handleSearchKeyPress } from 'utils'

const Custom404 = () => {
  const [t] = useTranslation('common')
  const [search, setSearch] = useState('')
  const { back, query, push } = useRouter()
  const searchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let s = query.query || query.search
    if (!s) {
      const q = new URLSearchParams(window.location.search)
      s = q.get('query') || q.get('search')
    }
    if (s) {
      setSearch(s as string)
      if (searchRef.current) {
        searchRef.current.value = s as string
      }
    }
  }, [setSearch, query])
  return (
    <Container
      className="full-height"
      sx={{ px: 1, py: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
    >
      {search ? (
        <Stack sx={{ px: { xs: 2, md: 16 } }}>
          <TextField
            autoFocus
            inputRef={searchRef}
            defaultValue={search}
            label={t('search')}
            onKeyPress={(e: any) => handleSearchKeyPress(e, push)}
            placeholder={SEARCH_FIELDS}
            helperText={
              <Stack>
                <Typography variant="body1">{t('notFoundMessage', { search })}</Typography>
                <Typography variant="body1" fontWeight={600} component="b">
                  {SEARCH_FIELDS}
                </Typography>
              </Stack>
            }
          />
          <Button
            onClick={back}
            variant="text"
            startIcon={<BackIcon />}
            sx={{ alignSelf: 'start', mt: 2 }}
            color="secondary"
          >
            {t('back')}
          </Button>
        </Stack>
      ) : (
        <Stack justifyContent="center" alignItems="center">
          {t('pageNotFound')}
          <Button
            onClick={back}
            variant="outlined"
            startIcon={<BackIcon />}
            color="secondary"
            sx={{ display: 'flex', alignItems: 'center', mt: 4 }}
          >
            {t('back')}
          </Button>
        </Stack>
      )}
    </Container>
  )
}

export const getStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common'])
  return {
    props: lng,
  }
}

export default Custom404
