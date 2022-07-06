import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useRef } from 'react'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Container, Stack, Typography } from '@mui/material'
import SvgIcon from '@mui/material/SvgIcon'
import Link from '@mui/material/Link'
import SubpageHead from 'components/SubpageHead'
import { SEARCH_FIELDS } from 'utils'
import SearchEmptyIcon from '../assets/icons/search-result-empty.svg'
import NotFoundIcon from '../assets/icons/404.svg'

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
    <>
      <SubpageHead subtitle={'404'} />
      <Container
        className="full-height"
        sx={{ px: 1, py: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      >
        <Stack sx={{ px: { xs: 2, md: 16 }, textAlign: 'center' }} alignItems="center">
          <SvgIcon
            sx={{
              'width': { xs: 66, md: 96 },
              'height': { xs: 66, md: 96 },
              '& g path': {
                fill: search && 'none',
              },
            }}
            component={search ? SearchEmptyIcon : NotFoundIcon}
            color="primary"
            viewBox="0 0 96 96"
          />
          {search ? (
            <Stack alignItems="center" sx={{ mt: { xs: 3, md: 9 } }}>
              <Typography
                variant="body2"
                fontSize={{ xs: 13, md: 14 }}
                sx={{ color: { xs: '#666', md: '#333' }, mb: 1 }}
              >
                {t('notFoundMessage', { search })}
              </Typography>
              <Typography variant="body2" fontSize={{ xs: 13, md: 14 }} color="secondary">
                {'block hash/txn hash/lockhash/ETH address/token name/token symbol'}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" color="secondary" fontSize={{ xs: 13, md: 14 }} sx={{ mt: { xs: 3, md: 6 } }}>
              {t('pageNotFound')}
            </Typography>
          )}
          <Link
            onClick={back}
            color="primary"
            fontSize={{ xs: 14, md: 16 }}
            fontWeight={500}
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', mt: { xs: 5, md: 4 } }}
          >
            {t('back')}
          </Link>
        </Stack>
      </Container>
    </>
  )
}

export const getStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common'])
  return {
    props: lng,
  }
}

export default Custom404
