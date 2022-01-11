import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { Box, Link } from '@mui/material'

const Pagination: React.FC<{ total: number; current: number; url: string; query?: object; onChange: any }> = ({
  total,
  current,
  url,
  query = {},
  onChange,
}) => {
  const [t] = useTranslation('common')
  if (!total) {
    return null
  }
  const prevPage = `${url}?${new URLSearchParams({ ...query, page: (current - 1).toString() })}`
  const nextPage = `${url}?${new URLSearchParams({ ...query, page: (current + 1).toString() })}`
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
        onChange={onChange}
        value={current}
      >
        {Array.from({ length: total }).map((_, idx) => (
          <option key={idx} defaultValue={idx}>
            {idx + 1}
          </option>
        ))}
      </select>
      {total > current ? (
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
