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
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material'
import BigNumber from 'bignumber.js'

import Address from 'components/TruncatedAddress'
import Pagination from 'components/Pagination'
import { timeDistance, getBridgedRecordListRes, CKB_EXPLORER_URL, CKB_DECIMAL, PCKB_UAN } from 'utils'

type ParsedList = ReturnType<typeof getBridgedRecordListRes>

const BridgedRecordList: React.FC<{
  list: ParsedList
  showUser?: boolean
}> = ({ list, showUser }) => {
  const [t, { language }] = useTranslation('list')
  return (
    <Box sx={{ px: 1, py: 2 }}>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ textTransform: 'capitalize' }}>
            <TableRow>
              <TableCell component="th">{t('type')}</TableCell>
              <TableCell component="th">{t('value')} </TableCell>
              <TableCell component="th" sx={{ textTransform: 'none' }}>
                {PCKB_UAN}
              </TableCell>
              <TableCell component="th">{t('age')} </TableCell>
              {showUser ? <TableCell component="th">{t('account')} </TableCell> : null}
              <TableCell component="th">{t('layer1Txn')} </TableCell>
              <TableCell component="th">{t('block')} </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {+list.meta.total ? (
              list.records.map(r => (
                <TableRow key={r.layer1.output.hash + r.layer1.output.index}>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: 12, md: 14 } }}>{t(r.type)}</TableCell>
                  <TableCell sx={{ fontSize: { xs: 12, md: 14 }, whiteSpace: 'nowrap' }}>
                    {r.token?.symbol !== PCKB_UAN
                      ? `${new BigNumber(r.value ?? '0').toFormat()} ${r.token.symbol ?? ''}`
                      : '0'}
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: 12, md: 14 }, whiteSpace: 'nowrap' }}>
                    {`${new BigNumber(r.capacity ?? '0').dividedBy(CKB_DECIMAL).toFormat()}`}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: 12, md: 14 } }}>
                    {r.timestamp > 0 ? (
                      <time dateTime={new Date(+r.timestamp).toISOString()}>{timeDistance(r.timestamp, language)}</time>
                    ) : (
                      t('pending')
                    )}
                  </TableCell>
                  {showUser ? (
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Address address={r.to} size="normal" />
                    </TableCell>
                  ) : null}
                  <TableCell>
                    {r.layer1.output.hash ? (
                      <Stack direction="row" alignItems="center">
                        <Tooltip title={r.layer1.output.hash} placement="top">
                          <Box>
                            <Link
                              href={`${CKB_EXPLORER_URL}/transaction/${r.layer1.output.hash}#${r.layer1.output.index}`}
                              underline="none"
                              target="_blank"
                              rel="noopener noreferrer"
                              display="flex"
                              alignItems="center"
                              color="secondary"
                            >
                              <Typography
                                className="mono-font"
                                overflow="hidden"
                                sx={{ userSelect: 'none', fontSize: { xs: 12, md: 14 } }}
                              >
                                {`${r.layer1.output.hash.slice(0, 8)}...${r.layer1.output.hash.slice(-8)}`}
                              </Typography>
                              <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
                            </Link>
                          </Box>
                        </Tooltip>
                      </Stack>
                    ) : (
                      t(`pending`)
                    )}
                  </TableCell>
                  <TableCell>
                    {r.block.hash ? (
                      <NextLink href={`/block/${r.block.hash}`}>
                        <Link
                          href={`/block/${r.block.hash}`}
                          underline="none"
                          color="secondary"
                          sx={{
                            fontSize: {
                              xs: 12,
                              md: 14,
                            },
                          }}
                        >
                          {(+r.block.number).toLocaleString('en')}
                        </Link>
                      </NextLink>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={showUser ? 7 : 6} align="center">
                  {t(`no_records`)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination total={+list.meta.total} page={+list.meta.page} />
    </Box>
  )
}
export default BridgedRecordList
