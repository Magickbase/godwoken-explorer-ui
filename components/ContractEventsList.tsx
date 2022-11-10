import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import Image from 'next/image'
import {
  Box,
  Stack,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Link,
  InputAdornment,
  TextField,
  tableCellClasses,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import ContractEventListItem from './ContractEventListItem'
import NoDataIcon from 'assets/icons/no-data.svg'
import { ParsedEventLog, IMG_URL, useDebounce } from 'utils'

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.root}`]: {
    borderBottom: '1px solid #f0f0f0',
  },
}))

export const EventFilterIcon = ({ setSearchText, tooltip, value }) => (
  <Box className="tooltip" data-tooltip={tooltip}>
    <Image
      src={`${IMG_URL}filter.svg`}
      loading="lazy"
      width="12"
      height="12"
      layout="fixed"
      alt="filter-icon"
      color="#333333"
      onClick={() => {
        setSearchText(value)
      }}
    />
  </Box>
)

const ContractEventsList = ({ list }: { list: ParsedEventLog[] }) => {
  const [t] = useTranslation('list')
  const [searchText, setSearchText] = useState('')
  const [listItems, setListItems] = useState(list)
  const debouncedSetListItems = useDebounce(setListItems, 300)

  useEffect(() => {
    debouncedSetListItems(
      list?.filter(item => {
        if (!item) {
          return false
        } else if (searchText === '') {
          return true
        } else if (new String(item.blockNumber).includes(searchText)) {
          return true
        } else if (item.topics[0].includes(searchText.toLowerCase())) {
          return true
        } else {
          return false
        }
      }),
    )
  }, [debouncedSetListItems, list, searchText])

  return listItems?.length ? (
    <Box sx={{ px: 1, py: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography fontSize={14} color="#333333" sx={{ m: 1.5 }}>
          <Image
            src={`${IMG_URL}event-list.svg`}
            loading="lazy"
            width="12"
            height="12"
            layout="fixed"
            alt="event-list-icon"
          />{' '}
          {t('latest25ContractEvents')}
        </Typography>
        <TextField
          InputProps={{
            sx: {
              'fontSize': 14,
              'height': 48,
              '& .MuiOutlinedInput-notchedOutline': {
                border: '1px solid #f0f0f0',
                borderRadius: 2,
              },
            },
            startAdornment: (
              <InputAdornment position="start">
                <Image
                  src={`${IMG_URL}search-icon.svg`}
                  loading="lazy"
                  width="17"
                  height="17"
                  layout="fixed"
                  alt="search-icon"
                />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          value={searchText}
          onChange={e => {
            setSearchText(e.target.value)
          }}
          placeholder={t('eventsFilterPlaceholder')}
          size="small"
          sx={{ fontSize: 14, flex: '0 1 240px', height: 48 }}
        />
      </Stack>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ textTransform: 'capitalize' }}>
            <TableRow sx={{ color: '#666666' }}>
              <StyledTableCell component="th">{t('txHash')}</StyledTableCell>
              {/* <StyledTableCell component="th">{t('method')} </StyledTableCell> */}
              <StyledTableCell component="th">{t('logs')}</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listItems?.map((item, idx) => (
              <TableRow key={item.id + '-' + idx}>
                <StyledTableCell>
                  <Stack>
                    <NextLink href={`/tx/${item.txHash}`} passHref>
                      <Link
                        href={`/tx/${item.txHash}`}
                        underline="none"
                        color="primary"
                        className="mono-font"
                        sx={{ fontSize: 14 }}
                      >
                        {item.txHash.slice(0, 17)}...
                      </Link>
                    </NextLink>
                    <Box sx={{ display: 'flex' }}>
                      <NextLink href={`/block/${item.blockNumber}`} passHref>
                        <Link
                          href={`/block/${item.blockNumber}`}
                          underline="none"
                          color="primary"
                          className="mono-font"
                          sx={{ fontSize: 14 }}
                        >
                          # {item.blockNumber}
                        </Link>
                      </NextLink>
                      <Box sx={{ pl: 0.5 }} />
                      <EventFilterIcon
                        setSearchText={setSearchText}
                        tooltip={t('filterEventBy', { filter: `BlockNo=${item.blockNumber}` })}
                        value={`${item.blockNumber}`}
                      />
                    </Box>
                  </Stack>
                </StyledTableCell>
                {/* <StyledTableCell>{item.method}</StyledTableCell> */}
                <StyledTableCell sx={{ pr: 1 }}>
                  <ContractEventListItem item={item} setSearchText={setSearchText} />
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  ) : (
    <Box>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '8.75rem 0',
          color: 'var(--primary-color)',
        }}
      >
        <NoDataIcon />
        <span style={{ marginTop: '2rem', color: 'var(--primary-text-color)' }}>{t(`no_records`)}</span>
      </div>
    </Box>
  )
}

export default ContractEventsList
