import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Box, Link } from '@mui/material'

const PAGE_SIZE = 10
const Pagination: React.FC<{ total: number; current: number }> = ({ total, current }) => {
  const [t] = useTranslation('common')
  const { query, push, asPath } = useRouter()
  const url = asPath.split('?')[0] ?? ''
  if (!total) {
    return null
  }
  const prevPage = `${url}?${new URLSearchParams({ ...query, page: (current - 1).toString() })}`
  const nextPage = `${url}?${new URLSearchParams({ ...query, page: (current + 1).toString() })}`
  const totalPage = Math.ceil(total / PAGE_SIZE)
  const handlePageChange = (e: React.SyntheticEvent<HTMLSelectElement>) => {
    const p = +e.currentTarget.value
    if (Number.isNaN(p) || p === +current) {
      return
    }

    push(`${url}?${new URLSearchParams({ ...query, page: p.toString() })}`)
  }

  return (
    <Box my={1} mr={1} sx={{ textAlign: 'right' }}>
      {current === 1 ? null : (
        <NextLink href={prevPage}>
          <Link href={prevPage} underline="none" fontSize={14} color="secondary">
            {t(`prev`)}
          </Link>
        </NextLink>
      )}
      <select
        style={{ border: 'none', padding: '2px 8px', margin: '0 8px', background: 'rgb(243, 244, 246)' }}
        onChange={handlePageChange}
        value={current}
      >
        {Array.from({ length: totalPage }).map((_, idx) => (
          <option key={idx} defaultValue={idx}>
            {idx + 1}
          </option>
        ))}
      </select>
      {totalPage > current ? (
        <NextLink href={nextPage}>
          <Link href={nextPage} underline="none" fontSize={14} color="secondary">
            {t(`next`)}
          </Link>
        </NextLink>
      ) : null}
    </Box>
  )
}

export default Pagination
