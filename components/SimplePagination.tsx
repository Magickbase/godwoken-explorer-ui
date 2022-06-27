import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Box, Link } from '@mui/material'

const SimplePagination: React.FC<Record<'before' | 'after', string | null>> = ({ before, after }) => {
  const [t] = useTranslation('common')
  const {
    query: { before: _before, after: _after, id: _, ...query },
    asPath,
  } = useRouter()
  const url = asPath.split('?')[0] ?? ''

  if (!before && !after) {
    return null
  }

  const prevPage = `${url}?${new URLSearchParams({ ...query, before })}`
  const nextPage = `${url}?${new URLSearchParams({ ...query, after })}`

  return (
    <Box my={1} mr={1} sx={{ textAlign: 'right' }}>
      {before ? (
        <NextLink href={prevPage}>
          <Link href={prevPage} underline="none" fontSize={14} color="secondary">
            {t(`prev`)}
          </Link>
        </NextLink>
      ) : null}
      {after ? (
        <NextLink href={nextPage}>
          <Link href={nextPage} underline="none" fontSize={14} color="secondary" sx={{ ml: 1 }}>
            {t(`next`)}
          </Link>
        </NextLink>
      ) : null}
    </Box>
  )
}

export default SimplePagination
