import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import {
  Stack,
  Box,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Link,
  Tooltip,
  Chip,
} from '@mui/material'
import BigNumber from 'bignumber.js'
import TxStatusIcon from './TxStatusIcon'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/Pagination'
import { timeDistance, getTxListRes } from 'utils'

type ParsedTxList = ReturnType<typeof getTxListRes>

const TxList: React.FC<{
  list: ParsedTxList
}> = ({ list }) => {
  const [t, { language }] = useTranslation('list')
  return (
    <Box sx={{ px: 1, py: 2 }}>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ textTransform: 'capitalize' }}>
            <TableRow>
              <TableCell component="th">{t('txHash')}</TableCell>
              <TableCell component="th">{t('block')} </TableCell>
              <TableCell component="th">{t('age')} </TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }} component="th">
                {t('from')}
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }} component="th">
                {t('to')}
              </TableCell>
              <TableCell sx={{ display: { xs: 'table-cell', md: 'none' } }} component="th">
                {t('transfer')}
              </TableCell>
              <TableCell component="th">{`${t('value')} (CKB)`}</TableCell>
              <TableCell component="th">{t('type')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {+list.totalCount ? (
              list.txs.map(item => (
                <TableRow key={item.hash}>
                  <TableCell>
                    <Stack direction="row" alignItems="center">
                      <TxStatusIcon status={item.status} isSuccess={item.isSuccess} />
                      <Tooltip title={item.hash} placement="top">
                        <Box>
                          <NextLink href={`/tx/${item.hash}`}>
                            <Link href={`/tx/${item.hash}`} underline="none" color="secondary">
                              <Typography
                                className="mono-font"
                                overflow="hidden"
                                sx={{ userSelect: 'none', fontSize: { xs: 12, md: 14 } }}
                              >
                                {`${item.hash.slice(0, 8)}...${item.hash.slice(-8)}`}
                              </Typography>
                            </Link>
                          </NextLink>
                        </Box>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <NextLink href={`/block/${item.blockHash}`}>
                      <Link
                        href={`/block/${item.blockHash}`}
                        underline="none"
                        color="secondary"
                        sx={{
                          fontSize: {
                            xs: 12,
                            md: 14,
                          },
                        }}
                      >
                        {(+item.blockNumber).toLocaleString('en')}
                      </Link>
                    </NextLink>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: 12, md: 14 } }}>
                    <time dateTime={new Date(+item.timestamp).toISOString()}>
                      {timeDistance(item.timestamp, language)}
                    </time>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Address address={item.from} size="normal" />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Address address={item.to} size="normal" />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'table-cell', md: 'none' } }}>
                    <Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontSize={12} sx={{ textTransform: 'capitalize', mr: 1 }} noWrap>{`${t(
                          'from',
                        )}:`}</Typography>
                        <Address leading={5} address={item.from} />
                      </Stack>

                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontSize={12} sx={{ textTransform: 'capitalize', mr: 1 }} noWrap>{`${t(
                          'to',
                        )}:`}</Typography>
                        <Address leading={5} address={item.to} />
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: 12, md: 14 }, whiteSpace: 'nowrap' }}>{`${new BigNumber(
                    item.value,
                  ).toFormat()}`}</TableCell>
                  <TableCell>
                    <Chip label={item.type} size="small" variant="outlined" color="primary" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {t(`no_records`)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination total={+list.totalCount} page={+list.page} pageSize={10} />
    </Box>
  )
}
export default TxList
