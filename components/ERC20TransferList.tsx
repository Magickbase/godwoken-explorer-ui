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
import { gql } from 'graphql-request'
import TxStatusIcon from './TxStatusIcon'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/SimplePagination'
import { timeDistance, getBlockStatus, GraphQLSchema, client, formatAmount } from 'utils'

export type TransferListProps = {
  token_transfers: {
    entries: Array<{
      amount: string
      transaction_hash: string
      log_index: number
      polyjuice: Pick<GraphQLSchema.Polyjuice, 'status'>
      from_address: string
      to_address: string
      block: Nullable<Pick<GraphQLSchema.Block, 'number' | 'timestamp' | 'status'>>
      udt: Nullable<Pick<GraphQLSchema.Udt, 'decimal' | 'symbol' | 'id'>>
    }>
    metadata: GraphQLSchema.PageMetadata
  }
}

const transferListQuery = gql`
  query (
    $from_address: String
    $to_address: String
    $start_block_number: Int
    $end_block_number: Int
    $before: String
    $after: String
    $combine_from_to: Boolean
    $token_contract_address_hash: String
  ) {
    token_transfers(
      input: {
        from_address: $from_address
        to_address: $to_address
        start_block_number: $start_block_number
        end_block_number: $end_block_number
        before: $before
        after: $after
        combine_from_to: $combine_from_to
        token_contract_address_hash: $token_contract_address_hash
      }
    ) {
      entries {
        amount
        transaction_hash
        log_index
        polyjuice {
          status
        }
        from_address
        to_address
        block {
          number
          timestamp
          status
        }
        udt {
          id
          decimal
          symbol
        }
      }

      metadata {
        total_count
        before
        after
      }
    }
  }
`

interface Cursor {
  before: string
  after: string
  start_block_number?: string
  end_block_number?: string
}

interface BlockTransferListVariables extends Nullable<Cursor> {}

interface AccountTransferListVariables extends Nullable<Cursor> {
  from_address: string
  to_address: string
}

interface TokenTransferListVariables extends Nullable<Cursor> {
  token_contract_address_hash: string
}

type Variables = BlockTransferListVariables | AccountTransferListVariables | TokenTransferListVariables

export const fetchTransferList = (variables: Variables) =>
  client.request<TransferListProps>(transferListQuery, variables).then(data => data.token_transfers)

const TransferList: React.FC<TransferListProps> = ({ token_transfers: { entries, metadata } }) => {
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
            {+metadata.total_count ? (
              entries.map(item => (
                <TableRow key={`${item.transaction_hash}-${item.log_index}`}>
                  <TableCell>
                    <Stack direction="row" alignItems="center">
                      <TxStatusIcon
                        status={getBlockStatus(item.block)}
                        isSuccess={item.polyjuice.status === GraphQLSchema.PolyjuiceStatus.Succeed}
                      />
                      <Tooltip title={item.transaction_hash} placement="top">
                        <Box>
                          <NextLink href={`/tx/${item.transaction_hash}`}>
                            <Link href={`/tx/${item.transaction_hash}`} underline="none" color="secondary">
                              <Typography
                                className="mono-font"
                                overflow="hidden"
                                sx={{ userSelect: 'none', fontSize: { xs: 12, md: 14 } }}
                              >
                                {`${item.transaction_hash.slice(0, 8)}...${item.transaction_hash.slice(-8)}`}
                              </Typography>
                            </Link>
                          </NextLink>
                        </Box>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {item.block ? (
                      <NextLink href={`/block/${item.block.number}`}>
                        <Link
                          href={`/block/${item.block.number}`}
                          underline="none"
                          color="secondary"
                          sx={{
                            fontSize: {
                              xs: 12,
                              md: 14,
                            },
                          }}
                        >
                          {item.block.number.toLocaleString('en')}
                        </Link>
                      </NextLink>
                    ) : (
                      t(`pending`)
                    )}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: 12, md: 14 } }}>
                    {item.block ? (
                      <time dateTime={new Date(item.block.timestamp).toISOString()}>
                        {timeDistance(item.block.timestamp, language)}
                      </time>
                    ) : (
                      t(`pending`)
                    )}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Address address={item.from_address} size="normal" />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Address address={item.to_address} size="normal" />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'table-cell', md: 'none' } }}>
                    <Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography
                          fontSize={12}
                          sx={{ textTransform: 'capitalize', mr: 1, whiteSpace: 'nowrap' }}
                        >{`${t('from')}:`}</Typography>
                        <Address leading={5} address={item.from_address} />
                      </Stack>

                      <Stack direction="row" justifyContent="space-between">
                        <Typography
                          fontSize={12}
                          sx={{ textTransform: 'capitalize', mr: 1, whiteSpace: 'nowrap' }}
                        >{`${t('to')}:`}</Typography>
                        <Address address={item.to_address} leading={5} />
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: 12, md: 14 }, whiteSpace: 'nowrap' }}>
                    {item.udt.id ? (
                      <NextLink href={`/token/${item.udt.id}`}>
                        <Link href={`/token/${item.udt.id}`} underline="none" color="secondary">
                          {formatAmount(item.amount, item.udt)}
                        </Link>
                      </NextLink>
                    ) : (
                      formatAmount(item.amount, item.udt)
                    )}
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
      <Stack direction="row-reverse">
        <Typography color="primary.light" variant="caption">
          {t(`last-n-records`, { n: `100k` })}
        </Typography>
      </Stack>
    </Box>
  )
}
export default TransferList
