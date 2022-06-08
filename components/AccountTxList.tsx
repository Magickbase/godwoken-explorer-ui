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
import { gql } from 'graphql-request'
import TxStatusIcon from './TxStatusIcon'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/SimplePagination'
import { timeDistance, GraphQLSchema, TxStatus, client, CKB_DECIMAL } from 'utils'

export type AccountTxList = {
  entries: Array<{
    eth_hash: string
    type: GraphQLSchema.TRANSACTION_TYPE
    block?: Pick<GraphQLSchema.Block, 'hash' | 'number' | 'status' | 'timestamp'>
    from_account: Pick<GraphQLSchema.Account, 'eth_address'>
    to_account: Pick<GraphQLSchema.Account, 'eth_address'>
    polyjuice: Pick<GraphQLSchema.Polyjuice, 'value' | 'status'>
  }>
  metadata: GraphQLSchema.PageMetadata
}

const txListQuery = gql`
  query ($address: String!, $before: String, $after: String) {
    transactions(input: { address: $address, before: $before, after: $after }) {
      entries {
        eth_hash
        block {
          hash
          number
          status
          timestamp
        }
        from_account {
          eth_address
        }
        to_account {
          eth_address
        }
        polyjuice {
          value
          status
        }
        type
      }
      metadata {
        total_count
        after
        before
      }
    }
  }
`
export const fetchTxList = (variables: { address: string; before: string | null; after: string | null }) =>
  client.request<{ transactions: AccountTxList }>(txListQuery, variables).then(data => data.transactions)

const getBlockStatus = (block: Pick<GraphQLSchema.Block, 'status'> | null): TxStatus => {
  switch (block?.status) {
    case GraphQLSchema.BLOCK_STATUS.Committed: {
      return 'committed'
    }
    case GraphQLSchema.BLOCK_STATUS.Finalized: {
      return 'finalized'
    }
    default: {
      return 'pending'
    }
  }
}

const TxList: React.FC<{ list: AccountTxList; maxCount?: string }> = ({ list: { entries, metadata }, maxCount }) => {
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
              <TableCell component="th" sx={{ whiteSpace: 'nowrap' }}>{`${t('value')} (CKB)`}</TableCell>
              <TableCell component="th">{t('type')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {metadata.total_count ? (
              entries.map(item => (
                <TableRow key={item.eth_hash}>
                  <TableCell>
                    <Stack direction="row" alignItems="center">
                      {item.polyjuice ? (
                        <TxStatusIcon
                          status={getBlockStatus(item.block)}
                          isSuccess={item.polyjuice.status === GraphQLSchema.POLYJUICE_STATUS.Succeed}
                        />
                      ) : (
                        <div style={{ display: 'flex', width: 24 }} />
                      )}
                      <Tooltip title={item.eth_hash} placement="top">
                        <Box>
                          <NextLink href={`/tx/${item.eth_hash}`}>
                            <Link href={`/tx/${item.eth_hash}`} underline="none" color="secondary">
                              <Typography
                                className="mono-font"
                                overflow="hidden"
                                sx={{ userSelect: 'none', fontSize: { xs: 12, md: 14 } }}
                              >
                                {`${item.eth_hash.slice(0, 8)}...${item.eth_hash.slice(-8)}`}
                              </Typography>
                            </Link>
                          </NextLink>
                        </Box>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {item.block ? (
                      <NextLink href={`/block/${item.block.hash}`}>
                        <Link
                          href={`/block/${item.block.hash}`}
                          underline="none"
                          color="secondary"
                          sx={{
                            fontSize: {
                              xs: 12,
                              md: 14,
                            },
                          }}
                        >
                          {(+item.block.number).toLocaleString('en')}
                        </Link>
                      </NextLink>
                    ) : (
                      t(`pending`)
                    )}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: 12, md: 14 } }}>
                    {item.block ? (
                      <time dateTime={item.block.timestamp}>
                        {timeDistance(new Date(item.block.timestamp).getTime(), language)}
                      </time>
                    ) : (
                      t(`pending`)
                    )}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Address address={item.from_account.eth_address} size="normal" />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Address address={item.to_account.eth_address} size="normal" />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'table-cell', md: 'none' } }}>
                    <Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontSize={12} sx={{ textTransform: 'capitalize', mr: 1 }} noWrap>{`${t(
                          'from',
                        )}:`}</Typography>
                        <Address leading={5} address={item.from_account.eth_address} />
                      </Stack>

                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontSize={12} sx={{ textTransform: 'capitalize', mr: 1 }} noWrap>{`${t(
                          'to',
                        )}:`}</Typography>
                        <Address leading={5} address={item.to_account.eth_address} />
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: 12, md: 14 }, whiteSpace: 'nowrap' }}>{`${new BigNumber(
                    item.polyjuice?.value ?? 0,
                  )
                    .dividedBy(new BigNumber(CKB_DECIMAL))
                    .toFormat()}`}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.type.replace(/_/g, ' ')}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ textTransform: 'capitalize' }}
                    />
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
      <Pagination {...metadata} />
      {maxCount ? (
        <Stack direction="row-reverse">
          <Typography color="primary.light" variant="caption">
            {t(`last-n-records`, { n: maxCount })}
          </Typography>
        </Stack>
      ) : null}
    </Box>
  )
}
export default TxList
