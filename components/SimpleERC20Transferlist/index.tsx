import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Stack, Box, Typography, IconButton, Menu, TextField, Button } from '@mui/material'
import { FilterAlt as FilterIcon, Clear as ClearIcon } from '@mui/icons-material'
import Table from 'components/Table'
import { gql } from 'graphql-request'
import Pagination from 'components/SimplePagination'
import { GraphQLSchema, client, formatAmount, useFilterMenu } from 'utils'
import styles from './styles.module.scss'

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
  query (
    $transaction_hash: String!
    $before: String
    $after: String
    $from_address: String
    $to_address: String
    $combine_from_to: Boolean
  ) {
    token_transfers(
      input: {
        transaction_hash: $transaction_hash
        before: $before
        after: $after
        from_address: $from_address
        to_address: $to_address
        combine_from_to: $combine_from_to
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
  combine_from_to?: boolean | null
}) =>
  client
    .request<TransferListProps>(transferListQuery, variables)
    .then(data => data.token_transfers)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

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
      dataset: { fields },
    } = e.currentTarget
    const fieldList = fields.split(',').filter(field => FILTER_KEYS.includes(field as any)) as Array<any>

    if (fieldList.length) {
      setFilters(fieldList)
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
    <div>
      <Table>
        <thead>
          <tr>
            <th>
              <Stack direction="row" alignItems="center" whiteSpace="nowrap">
                {t('from')}
                <IconButton size="small" data-fields="address_from" onClick={handleBlockFilterOpen}>
                  <FilterIcon fontSize="inherit" />
                </IconButton>
              </Stack>
            </th>
            <th>
              <Stack direction="row" alignItems="center" whiteSpace="nowrap">
                {t('to')}
                <IconButton size="small" data-fields="address_to" onClick={handleBlockFilterOpen}>
                  <FilterIcon fontSize="inherit" />
                </IconButton>
              </Stack>
            </th>
            <th>{`${t('value')}`}</th>
          </tr>
        </thead>
        <tbody>
          {metadata.total_count ? (
            entries.map(item => (
              <tr key={`${item.transaction_hash}-{item.log_index}`}>
                <td className={styles.address}>
                  <NextLink href={`/account/${item.from_address}`}>
                    <a className="mono-font">
                      <span>{item.from_address}</span>
                      <span>{`${item.from_address.slice(0, 8)}...${item.from_address.slice(-8)}`}</span>
                    </a>
                  </NextLink>
                </td>
                <td className={styles.address}>
                  <NextLink href={`/account/${item.to_address}`}>
                    <a className="mono-font">
                      <span> {item.to_address} </span>
                      <span> {`${item.to_address.slice(0, 8)}...${item.to_address.slice(-8)}`} </span>
                    </a>
                  </NextLink>
                </td>
                <td title={item.udt.name}>
                  {item.udt?.id ? (
                    <NextLink href={`/token/${item.udt.id}`}>
                      <a>{formatAmount(item.amount, item.udt)}</a>
                    </NextLink>
                  ) : (
                    formatAmount(item.amount, item.udt)
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center' }}>
                {t(`no_records`)}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
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
    </div>
  )
}
export default TransferList
