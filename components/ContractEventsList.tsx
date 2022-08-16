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
  Tooltip,
  InputAdornment,
  TextField,
} from '@mui/material'
import ContractEventListItem from './ContractEventListItem'
import NoDataIcon from 'assets/icons/no-data.svg'
import { ParsedEventLog, IMG_URL, useDebounce } from 'utils'

export const EventFilterIcon = ({ setSearchText, tooltip, value }) => (
  <Tooltip title={tooltip} placement="top">
    <Box>
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
  </Tooltip>
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
            style: { fontSize: 14 },
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
          sx={{ fontSize: 14, flex: '0 1 260px' }}
        />
      </Stack>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ textTransform: 'capitalize' }}>
            <TableRow sx={{ color: '#666666' }}>
              <TableCell component="th">{t('txHash')}</TableCell>
              {/* <TableCell component="th">{t('method')} </TableCell> */}
              <TableCell component="th">{t('logs')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listItems?.map((item, idx) => (
              <TableRow key={item.id + '-' + idx}>
                <TableCell>
                  <Stack>
                    <NextLink href={`/tx/${item.txHash}`} passHref>
                      <Link
                        href={`/tx/${item.txHash}`}
                        underline="none"
                        color="secondary"
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
                          color="secondary"
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
                </TableCell>
                {/* <TableCell>{item.method}</TableCell> */}
                <TableCell sx={{ pr: 1 }}>
                  <ContractEventListItem item={item} setSearchText={setSearchText} />
                </TableCell>
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
