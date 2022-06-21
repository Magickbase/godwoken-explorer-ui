import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import {
  Stack,
  Box,
  Link,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  IconButton,
  Menu,
  TextField,
  Button,
} from '@mui/material'
import { FilterAlt as FilterIcon, Clear as ClearIcon } from '@mui/icons-material'
import { gql } from 'graphql-request'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/SimplePagination'
import { GraphQLSchema, client, formatAmount, useFilterMenu } from 'utils'

export type TransferListProps = {
  token_transfers: {
    entries: Array<{
      amount: string
      block: Nullable<Pick<GraphQLSchema.Block, 'number' | 'timestamp'>>
      from_address: string
      to_address: string
      log_index: number
      transaction_hash: string
      udt: Nullable<Pick<GraphQLSchema.Udt, 'decimal' | 'name' | 'symbol' | 'id' | 'icon'>>
    }>
    metadata: GraphQLSchema.PageMetadata
  }
}

const transferListQuery = gql`
  query ($transaction_hash: String!, $before: String, $after: String, $from_address: String, $to_address: String) {
    token_transfers(
      input: {
        transaction_hash: $transaction_hash
        before: $before
        after: $after
        from_address: $from_address
        to_address: $to_address
      }
    ) {
      entries {
        amount
        from_address
        to_address
        from_account {
          eth_address
          script_hash
        }
        to_account {
          eth_address
          script_hash
        }
        block {
          number
          timestamp
        }
        log_index
        transaction_hash
        udt {
          decimal
          name
          symbol
          id
          icon
        }
      }
      metadata {
        before
        after
        total_count
      }
    }
  }
`

export const fetchTransferList = (variables: {
  transaction_hash: string
  before: string | null
  after: string | null
  from_address?: string | null
  to_address?: string | null
}) => client.request<TransferListProps>(transferListQuery, variables).then(data => data.token_transfers)

const FILTER_KEYS = ['address_from', 'address_to'] as const
const TransferList: React.FC<TransferListProps> = ({ token_transfers: { entries, metadata } }) => {
  const [t] = useTranslation('list')
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
    const {
      dataset: { field },
    } = e.currentTarget
    if (FILTER_KEYS.includes(field as any)) {
      setFilters([field as any])
      handleFilterOpen(e)
    }
  }

  const handleFilterSubmit = handleFilterSubmitFunc({
    filterKeys: FILTER_KEYS,
    url: asPath,
    push,
    query: query as Record<string, string>,
  })

  return (
    <Box sx={{ px: 1, py: 2 }}>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ textTransform: 'capitalize' }}>
            <TableRow>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }} component="th">
                <Stack direction="row" alignItems="center" whiteSpace="nowrap">
                  {t('from')}
                  <IconButton size="small" data-field="address_from" onClick={handleBlockFilterOpen}>
                    <FilterIcon fontSize="inherit" />
                  </IconButton>
                </Stack>
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }} component="th">
                <Stack direction="row" alignItems="center" whiteSpace="nowrap">
                  {t('to')}
                  <IconButton size="small" data-field="address_to" onClick={handleBlockFilterOpen}>
                    <FilterIcon fontSize="inherit" />
                  </IconButton>
                </Stack>
              </TableCell>
              <TableCell sx={{ display: { xs: 'table-cell', md: 'none' } }} component="th">
                {t('transfer')}
              </TableCell>
              <TableCell component="th">{`${t('value')}`}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {metadata.total_count ? (
              entries.map(item => (
                <TableRow key={`${item.transaction_hash}-{item.log_index}`}>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <NextLink href={`/account/${item.from_address}`}>
                      <Link
                        href={`/account/${item.from_address}`}
                        underline="none"
                        color="secondary"
                        className="mono-font"
                      >
                        {item.from_address}
                      </Link>
                    </NextLink>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <NextLink href={`/account/${item.to_address}`}>
                      <Link
                        href={`/account/${item.to_address}`}
                        underline="none"
                        color="secondary"
                        className="mono-font"
                      >
                        {item.to_address}
                      </Link>
                    </NextLink>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'table-cell', md: 'none' } }}>
                    <Stack>
                      <Stack direction="row">
                        <Typography
                          fontSize={12}
                          sx={{ minWidth: '35px', textTransform: 'capitalize', mr: 1, whiteSpace: 'nowrap' }}
                        >{`${t('from')}:`}</Typography>
                        <Address leading={8} address={item.from_address} />
                      </Stack>

                      <Stack direction="row">
                        <Typography
                          fontSize={12}
                          sx={{ minWidth: '35px', textTransform: 'capitalize', mr: 1, whiteSpace: 'nowrap' }}
                        >{`${t('to')}:`}</Typography>
                        <Address address={item.to_address} leading={8} />
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }} title={item.udt.name}>
                    <NextLink href={`/token/${item.udt.id}`}>
                      <Link href={`/token/${item.udt.id}`} underline="none" color="secondary">
                        {formatAmount(item.amount, item.udt)}
                      </Link>
                    </NextLink>
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
