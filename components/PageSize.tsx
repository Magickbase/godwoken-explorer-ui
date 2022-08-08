import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { MenuItem, Select, SelectChangeEvent, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import NextPageIcon from 'assets/icons/next-page.svg'

export const SIZES = ['15', '30', '50']

const PageSize = () => {
  const [t] = useTranslation('common')
  const { query, push, asPath } = useRouter()
  const url = asPath.split('?')[0] ?? ''
  const [open, setOpen] = useState(false)
  const theme = useTheme()

  const pageSize = query.page_size && !Number.isNaN(+query.page_size) ? +query.page_size : +SIZES[1]

  const handlePageSizeChange = (e: SelectChangeEvent<number>) => {
    const s = +e.target.value
    if (s === pageSize) {
      return
    }
    push(`${url}?${new URLSearchParams({ ...query, page_size: s.toString() })}`)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleOpen = () => {
    setOpen(true)
  }

  return (
    <Stack direction="row" alignItems="center" spacing={{ xs: 0.6, md: 1 }}>
      <Typography color="#666" fontSize={{ xs: 13, md: 14 }}>
        {t(`page_size.show`)}
      </Typography>
      <Select
        onChange={e => handlePageSizeChange(e)}
        value={pageSize}
        variant="standard"
        open={open}
        onClose={handleClose}
        onOpen={handleOpen}
        onClick={() => setOpen(!open)}
        IconComponent={() => <NextPageIcon color="secondary" />}
        sx={{
          'border': { xs: '0.5px solid #F0F0F0', md: '1px solid #F0F0F0' },
          'cursor': 'pointer',
          'borderRadius': { xs: 1, md: 2 },
          'py': { xs: 0, md: 0.3 },
          'px': { xs: 0.6, md: 1.1 },
          'color': '#666',
          'fontSize': { xs: 13, md: 14 },
          '&::before': { content: 'none' },
          '&::after': { content: 'none' },
          '& .MuiSelect-select:focus': { backgroundColor: 'unset' },
          '& .MuiSelect-select': {
            flex: '0 1 16px',
            py: { xs: '2px', md: 0 },
            pl: { xs: '2px', md: '4px' },
            pr: '0px !important',
          },
          '& svg': {
            transform: 'rotate(90deg)',
            color: 'secondary.light',
            cursor: 'pointer',
            mb: { xs: 0.2, md: 0 },
            mr: 0.5,
            mt: { xs: 0, md: 0.8 },
            height: { xs: 16, md: 20 },
            width: { xs: 12, md: 20 },
          },
        }}
        MenuProps={{
          sx: {
            '& .MuiPaper-root': {
              boxShadow: `0px 2px 4px ${theme.palette.primary.light}`,
              mt: 1,
              ml: 1,
            },
          },
        }}
      >
        {SIZES.map(s => (
          <MenuItem key={s} value={s} sx={{ justifyContent: 'center', fontSize: { xs: 13, md: 14 } }}>
            {s}
          </MenuItem>
        ))}
      </Select>
      <Typography color="#666" fontSize={{ xs: 13, md: 14 }}>
        {t(`page_size.records`)}
      </Typography>
    </Stack>
  )
}

export default PageSize
