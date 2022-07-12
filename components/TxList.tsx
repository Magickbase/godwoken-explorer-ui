import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
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
  IconButton,
  Menu,
  TextField,
  Button,
} from '@mui/material'
import { FilterAlt as FilterIcon, Clear as ClearIcon } from '@mui/icons-material'
import BigNumber from 'bignumber.js'
import { gql } from 'graphql-request'
import TxStatusIcon from './TxStatusIcon'
import Address from 'components/TruncatedAddress'
import PageSize from 'components/PageSize'
import Pagination from 'components/SimplePagination'
import TransferDirection from 'components/TransferDirection'
import { timeDistance, GraphQLSchema, TxStatus, client, GCKB_DECIMAL, useFilterMenu, PCKB_UAN } from 'utils'

export type TxListProps = {
  transactions: {
    entries: Array<{
      hash: string
      eth_hash: string | null
      type: GraphQLSchema.TransactionType
      block?: Pick<GraphQLSchema.Block, 'hash' | 'number' | 'status' | 'timestamp'>
      from_account: Pick<GraphQLSchema.Account, 'eth_address' | 'script_hash' | 'type'>
      to_account: Pick<GraphQLSchema.Account, 'eth_address' | 'script_hash' | 'type'>
      polyjuice: Pick<GraphQLSchema.Polyjuice, 'value' | 'status'>
    }>
    metadata: GraphQLSchema.PageMetadata
  }
}

const txListQuery = gql`
  query (
    $address: String
    $script_hash: String
    $before: String
    $after: String
    $limit: Int
    $start_block_number: Int
    $end_block_number: Int
  ) {
    transactions(
      input: {
        address: $address
        script_hash: $script_hash
        before: $before
        after: $after
        limit: $limit
        start_block_number: $start_block_number
        end_block_number: $end_block_number
      }
    ) {
      entries {
        hash
        eth_hash
        block {
          hash
          number
          status
          timestamp
        }
        from_account {
          type
          eth_address
          script_hash
        }
        to_account {
          type
          eth_address
          script_hash
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
interface Cursor {
  limit?: number
  before: string
  after: string
  start_block_number?: number | null
  end_block_number?: number | null
}
interface EthAccountTxListVariables extends Nullable<Cursor> {
  address?: string | null
}
interface GwAccountTxListVariables extends Nullable<Cursor> {
  script_hash?: string | null
}
interface BlockTxListVariables extends Nullable<Cursor> {}
type Variables = Cursor | EthAccountTxListVariables | GwAccountTxListVariables | BlockTxListVariables

export const fetchTxList = (variables: Variables) =>
  client
    .request<TxListProps>(txListQuery, variables)
    .then(data => data.transactions)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

const getBlockStatus = (block: Pick<GraphQLSchema.Block, 'status'> | null): TxStatus => {
  switch (block?.status) {
    case GraphQLSchema.BlockStatus.Committed: {
      return 'committed'
    }
    case GraphQLSchema.BlockStatus.Finalized: {
      return 'finalized'
    }
    default: {
      return 'pending'
    }
  }
}

const FILTER_KEYS = ['block_from', 'block_to'] as const
const TxList: React.FC<TxListProps & { maxCount?: string; pageSize?: number; viewer?: string }> = ({
  transactions: { entries, metadata },
  maxCount,
  pageSize,
  viewer,
}) => {
  const [t, { language }] = useTranslation('list')
  const {
    query: { id: _, ...query },
    push,
    asPath,
  } = useRouter()
  const {
    filters,
    setFilters,
    handleFilterOpen,
    handleFilterDismiss,
    filterAnchorEl,
    handleFilterSubmit: handleFilterSubmitFunc,
    handleFilterClear,
  } = useFilterMenu<typeof FILTER_KEYS[number]>()

  const handleBlockFilterOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setFilters(['block_from', 'block_to'])
    handleFilterOpen(e)
  }

  const handleFilterSubmit = handleFilterSubmitFunc({
    filterKeys: FILTER_KEYS,
    query: query as Record<string, string>,
    url: asPath,
    push,
  })

  return (
    <Box sx={{ px: 1, py: 2 }}>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ textTransform: 'capitalize' }}>
            <TableRow>
              <TableCell component="th">{t('txHash')}</TableCell>
              <TableCell component="th">
                <Stack direction="row" alignItems="center" whiteSpace="nowrap">
                  {t('block')}
                  <IconButton size="small" onClick={handleBlockFilterOpen}>
                    <FilterIcon fontSize="inherit" />
                  </IconButton>
                </Stack>
              </TableCell>
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
              <TableCell component="th" sx={{ whiteSpace: 'nowrap', textTransform: 'none' }}>{`${t(
                'value',
              )} (${PCKB_UAN})`}</TableCell>
              <TableCell component="th">{t('type')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {metadata.total_count ? (
              entries.map(item => {
                const hash = item.eth_hash || item.hash
                const from = item.from_account.eth_address || item.from_account.script_hash
                const to = item.to_account.eth_address || item.to_account.script_hash

                return (
                  <TableRow key={hash}>
                    <TableCell>
                      <Stack direction="row" alignItems="center">
                        {item.polyjuice ? (
                          <TxStatusIcon
                            status={getBlockStatus(item.block)}
                            isSuccess={item.polyjuice.status === GraphQLSchema.PolyjuiceStatus.Succeed}
                          />
                        ) : (
                          <div style={{ display: 'flex', width: 24 }} />
                        )}
                        <Tooltip title={hash} placement="top">
                          <Box>
                            <NextLink href={`/tx/${hash}`}>
                              <Link href={`/tx/${hash}`} underline="none" color="secondary">
                                <Typography
                                  className="mono-font"
                                  overflow="hidden"
                                  sx={{ userSelect: 'none', fontSize: { xs: 12, md: 14 } }}
                                >
                                  {`${hash.slice(0, 8)}...${hash.slice(-8)}`}
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
                      <Address address={from} type={item.from_account.type} size="normal" />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Address address={to} type={item.to_account.type} size="normal" />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'table-cell', md: 'none' } }}>
                      <Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography fontSize={12} sx={{ textTransform: 'capitalize', mr: 1 }} noWrap>{`${t(
                            'from',
                          )}:`}</Typography>
                          <Address leading={5} address={from} type={item.from_account.type} />
                        </Stack>

                        <Stack direction="row" justifyContent="space-between">
                          <Typography fontSize={12} sx={{ textTransform: 'capitalize', mr: 1 }} noWrap>{`${t(
                            'to',
                          )}:`}</Typography>
                          <Address leading={5} address={to} type={item.to_account.type} />
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: 12, md: 14 } }}>
                      <div style={{ display: 'flex', whiteSpace: 'nowrap' }}>
                        <TransferDirection from={from} to={to} viewer={viewer ?? ''} />
                        {`${new BigNumber(item.polyjuice?.value ?? 0).dividedBy(GCKB_DECIMAL).toFormat()}`}
                      </div>
                    </TableCell>
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
                )
              })
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
      <Menu
        anchorEl={filterAnchorEl}
        open={!!filterAnchorEl}
        onClose={handleFilterDismiss}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <form onSubmit={handleFilterSubmit}>
          {filters.map((field, idx) => {
            return (
              <Box key={field} px="16px" py="4px">
                <TextField
                  type={['block_from', 'block_to'].includes(field) ? 'number' : 'text'}
                  name={field}
                  label={t(field)}
                  size="small"
                  defaultValue={query[field] ?? ''}
                  autoFocus={!idx}
                  sx={{
                    label: {
                      textTransform: 'capitalize',
                    },
                  }}
                />
              </Box>
            )
          })}
          <Stack direction="row" justifyContent="space-between" px="16px" pt="16px">
            <Button type="submit" variant="contained" size="small" startIcon={<FilterIcon />}>
              {t(`filter`)}
            </Button>
            <Button type="button" variant="text" onClick={handleFilterClear} size="small" startIcon={<ClearIcon />}>
              {t(`clear`)}
            </Button>
          </Stack>
        </form>
      </Menu>
      {pageSize ? (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <PageSize pageSize={pageSize} />
          <Pagination {...metadata} />
        </Stack>
      ) : (
        <Pagination {...metadata} />
      )}
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
