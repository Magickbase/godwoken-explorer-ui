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
} from '@mui/material'
import BigNumber from 'bignumber.js'
import TxStatusIcon from './TxStatusIcon'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/Pagination'
import { timeDistance, getERC20TransferListRes } from 'utils'

type ParsedTransferList = ReturnType<typeof getERC20TransferListRes>

const TransferList: React.FC<{
  list: ParsedTransferList
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
              <TableCell component="th">{`${t('value')}`}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {+list.totalCount ? (
              list.txs.map(item => (
                <TableRow key={item.hash + item.logIndex}>
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
                    <NextLink href={`/block/${item.blockNumber}`}>
                      <Link
                        href={`/block/${item.blockNumber}`}
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
                    {item.to ? <Address address={item.to} size="normal" /> : null}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'table-cell', md: 'none' } }}>
                    <Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography
                          fontSize={12}
                          sx={{ textTransform: 'capitalize', mr: 1, whiteSpace: 'nowrap' }}
                        >{`${t('from')}:`}</Typography>
                        <Address leading={5} address={item.from} />
                      </Stack>

                      <Stack direction="row" justifyContent="space-between">
                        <Typography
                          fontSize={12}
                          sx={{ textTransform: 'capitalize', mr: 1, whiteSpace: 'nowrap' }}
                        >{`${t('to')}:`}</Typography>
                        {item.to ? <Address address={item.to} leading={5} /> : null}
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: 12, md: 14 }, whiteSpace: 'nowrap' }}>
                    {item.transferValue
                      ? `${new BigNumber(item.transferValue).toFormat()} ${item.udtSymbol ?? ''}`
                      : null}
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
      <Pagination total={+list.totalCount} page={+list.page} />
      <Stack direction="row-reverse">
        <Typography color="primary.light" variant="caption">
          {t(`last-n-records`, { n: `100k` })}
        </Typography>
      </Stack>
    </Box>
  )
}
export default TransferList
