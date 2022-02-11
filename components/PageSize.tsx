import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { Stack, Typography } from '@mui/material'

export const SIZES = ['15', '30', '50']

const PageSize: React.FC<{ pageSize: number }> = ({ pageSize }) => {
  const [t] = useTranslation('common')
  const { query, push, asPath } = useRouter()
  const url = asPath.split('?')[0] ?? ''

  const handlePageSizeChange = (e: React.SyntheticEvent<HTMLSelectElement>) => {
    const s = +e.currentTarget.value
    if (s === pageSize) {
      return
    }
    push(`${url}?${new URLSearchParams({ ...query, page_size: s.toString() })}`)
  }

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="body2">{t(`page_size.show`)}</Typography>
      <select
        onChange={handlePageSizeChange}
        value={pageSize}
        style={{
          border: 'none',
          padding: '2px 8px',
          background: 'rgb(243, 244, 246)',
        }}
      >
        {SIZES.map(s => (
          <option key={s} defaultValue={s}>
            {s}
          </option>
        ))}
      </select>
      <Typography variant="body2">{t(`page_size.records`)}</Typography>
    </Stack>
  )
}

export default PageSize
