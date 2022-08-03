import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { Stack, Box, TableContainer, Typography, Link, Tooltip } from '@mui/material'
import BigNumber from 'bignumber.js'
import TxStatusIcon from './TxStatusIcon'
import Table from 'components/Table'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/Pagination'
import { timeDistance, getERC20TransferListRes } from 'utils'
import TransferDirection from './TransferDirection'

type ParsedTransferList = ReturnType<typeof getERC20TransferListRes>

const TransferList: React.FC<{
  list: ParsedTransferList
  viewer?: string
}> = ({ list, viewer }) => {
  const [t, { language }] = useTranslation('list')
  return (
    <Box sx={{ px: 1, py: 2 }}>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>{t('txHash')}</th>
              <th>{t('block')} </th>
              <th>{t('age')} </th>
              <th>{t('from')}</th>
              <th>{t('to')}</th>
              <th>{`${t('value')}`}</th>
            </tr>
          </thead>
          <tbody>
            {+list.totalCount ? (
              list.txs.map(item => (
                <tr key={item.hash + item.logIndex}>
                  <td>
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
                  </td>
                  <td>
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
                  </td>
                  <td>
                    <time dateTime={new Date(+item.timestamp).toISOString()}>
                      {timeDistance(item.timestamp, language)}
                    </time>
                  </td>
                  <td>
                    <Address address={item.from} />
                  </td>
                  <td>{item.to ? <Address address={item.to} /> : null}</td>
                  <td>
                    <div style={{ display: 'flex', whiteSpace: 'nowrap' }}>
                      <TransferDirection from={item.from} to={item.to} viewer={viewer ?? ''} />
                      {item.transferValue
                        ? `${new BigNumber(item.transferValue).toFormat()} ${item.udtSymbol ?? ''}`
                        : null}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} align="center">
                  {t(`no_records`)}
                </td>
              </tr>
            )}
          </tbody>
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
