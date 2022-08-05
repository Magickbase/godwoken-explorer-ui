import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Box, Link, Stack } from '@mui/material'
import { PAGE_SIZE } from 'utils'
import NextPageIcon from 'assets/icons/next-page.svg'

// TODO: fix total count calculation then add page size selector
const Pagination: React.FC<{ total: number; page: number; pageSize?: number }> = ({
  total,
  page = 1,
  pageSize = PAGE_SIZE,
}) => {
  const [t] = useTranslation('common')
  const { query, asPath } = useRouter()
  const url = asPath.split('?')[0] ?? ''
  if (!total) {
    return null
  }
  const prevPage = `${url}?${new URLSearchParams({ ...query, page: (page - 1).toString() })}`
  const nextPage = `${url}?${new URLSearchParams({ ...query, page: (page + 1).toString() })}`
  const totalPage = Math.ceil(total / pageSize)
  console.log({ totalPage, page })

  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center' }} mt={{ xs: 2, sm: 0 }}>
      <NextLink href={page === 1 ? asPath : prevPage} passHref>
        <Link
          title={t(`prev`)}
          href={prevPage}
          underline="none"
          fontSize={14}
          color={page <= 1 ? '#ccc' : 'secondary'}
          sx={{
            'transform': 'rotate(180deg)',
            'display': 'flex',
            'mr': { xs: '5.5px', md: '1px' },
            'pl': 1.5,
            'py': 1,
            'pr': { xs: 1.5, md: '0' },
            '&:hover': { color: page <= 1 ? '#ccc' : 'primary.main' },
            'borderRadius': '2px',
            'bgcolor': { xs: '#fafafa', sm: 'unset' },
            'pointerEvents': page <= 1 ? 'none' : 'auto',
          }}
        >
          <NextPageIcon />
        </Link>
      </NextLink>
      {new Array(Math.min(totalPage, 5)).fill(0).map((_, idx) => {
        const p = page < 3 ? idx + 1 : page - 2 + idx
        const href = `${url}?${new URLSearchParams({ ...query, page: p.toString() })}`
        return (
          p > 0 &&
          p <= totalPage && (
            <Box
              key={p}
              sx={{
                px: '14px',
                py: '1.25px',
                mx: { xs: '5.5px', md: '1px' },
                borderRadius: '2px',
                bgcolor: { xs: '#fafafa', sm: 'unset' },
              }}
            >
              <NextLink href={href} passHref>
                <Link
                  href={href}
                  fontWeight={500}
                  underline="none"
                  fontSize={{ xs: 12, md: 14 }}
                  color={p === +page ? 'primary' : '#666'}
                  sx={{ '&:hover': { color: 'primary.main' }, 'lineHeight': '1.5rem' }}
                >
                  {p}
                </Link>
              </NextLink>
            </Box>
          )
        )
      })}
      <NextLink href={nextPage} passHref>
        <Link
          title={t(`next`)}
          href={page >= totalPage ? asPath : nextPage}
          underline="none"
          fontSize={14}
          color={page >= totalPage ? '#ccc' : 'secondary'}
          sx={{
            'display': 'flex',
            'ml': { xs: '5.5px', md: '1px' },
            'pl': 1.5,
            'py': 1,
            'pr': { xs: 1.5, md: '0' },
            '&:hover': { color: 'primary.main' },
            'borderRadius': '2px',
            'bgcolor': { xs: '#fafafa', sm: 'unset' },
            'pointerEvents': page >= totalPage ? 'none' : 'auto',
          }}
        >
          <NextPageIcon />
        </Link>
      </NextLink>
    </Stack>
  )
}

export default Pagination
