import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Typography, IconButton, Menu, TextField, Button } from '@mui/material'
import { FilterAlt as FilterIcon, Clear as ClearIcon } from '@mui/icons-material'
import BigNumber from 'bignumber.js'
import { gql } from 'graphql-request'
import Table from 'components/Table'
import TxStatusIcon from '../TxStatusIcon'
import HashLink from 'components/HashLink'
import Address from 'components/TruncatedAddress'
import PageSize from 'components/PageSize'
import Pagination from 'components/SimplePagination'
import TransferDirection from 'components/TransferDirection'
import Tooltip from 'components/Tooltip'
import TxType from 'components/TxType'
import { getBlockStatus, timeDistance, GraphQLSchema, client, GCKB_DECIMAL, useFilterMenu, PCKB_SYMBOL } from 'utils'
import styles from './styles.module.scss'

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
  viewer?: string
}

const txListQuery = gql`
  query (
    $address: HashAddress
    $script_hash: HashFull
    $before: String
    $after: String
    $limit: Int
    $start_block_number: Int
    $end_block_number: Int
  ) {
    transactions(
      input: {
        from_eth_address: $address
        to_eth_address: $address
        from_script_hash: $script_hash
        to_script_hash: $script_hash
        before: $before
        after: $after
        limit: $limit
        start_block_number: $start_block_number
        end_block_number: $end_block_number
        combine_from_to: true
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

const FILTER_KEYS = ['block_from', 'block_to'] as const
const TxList: React.FC<TxListProps & { maxCount?: string; pageSize?: number }> = ({
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
    <div className={styles.container}>
      <Table>
        <thead>
          <tr>
            <th>{t('txHash')}</th>
            <th>
              {t('block')}
              <IconButton size="small" onClick={handleBlockFilterOpen}>
                <FilterIcon fontSize="inherit" />
              </IconButton>
            </th>
            <th>{t('age')}</th>
            <th>{t('from')}</th>
            <th>{t('to')}</th>
            <th>{`${t('value')} (${PCKB_SYMBOL})`}</th>
            <th>{t('type')}</th>
          </tr>
        </thead>
        <tbody>
          {metadata.total_count ? (
            entries.map(item => {
              const hash = item.eth_hash || item.hash
              const from = item.from_account.eth_address || item.from_account.script_hash
              const to = item.to_account.eth_address || item.to_account.script_hash

              return (
                <tr key={hash}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title={hash} placement="top">
                        <div style={{ paddingRight: 4 }}>
                          <HashLink label={`${hash.slice(0, 8)}...${hash.slice(-8)}`} href={`/tx/${hash}`} />
                        </div>
                      </Tooltip>
                      <TxStatusIcon
                        status={getBlockStatus(item.block)}
                        isSuccess={
                          item.polyjuice ? item.polyjuice.status === GraphQLSchema.PolyjuiceStatus.Succeed : true
                        }
                      />
                    </div>
                  </td>
                  <td>
                    {item.block ? (
                      <NextLink href={`/block/${item.block.hash}`}>
                        <a>{(+item.block.number).toLocaleString('en')}</a>
                      </NextLink>
                    ) : (
                      t(`pending`)
                    )}
                  </td>
                  <td>
                    {item.block ? (
                      <time dateTime={item.block.timestamp}>
                        {timeDistance(new Date(item.block.timestamp).getTime(), language)}
                      </time>
                    ) : (
                      t(`pending`)
                    )}
                  </td>
                  <td>
                    <Address address={from} type={item.from_account.type} />
                  </td>
                  <td>
                    <Address address={to} type={item.to_account.type} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <TransferDirection from={from} to={to} viewer={viewer ?? ''} />
                      {`${new BigNumber(item.polyjuice?.value ?? 0).dividedBy(GCKB_DECIMAL).toFormat()}`}
                    </div>
                  </td>
                  <td>
                    <TxType type={item.type} />
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={7} align="center" style={{ textAlign: 'center' }}>
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
              <div key={field} style={{ padding: '4px 16px' }}>
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
              </div>
            )
          })}
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '16px' }}>
            <Button type="submit" variant="contained" size="small" startIcon={<FilterIcon />}>
              {t(`filter`)}
            </Button>
            <Button type="button" variant="text" onClick={handleFilterClear} size="small" startIcon={<ClearIcon />}>
              {t(`clear`)}
            </Button>
          </div>
        </form>
      </Menu>
      {pageSize ? (
        <Pagination
          {...metadata}
          pageSize={`${pageSize}`}
          note={maxCount ? t(`last-n-records`, { n: maxCount }) : ''}
        />
      ) : (
        <Pagination {...metadata} note={maxCount ? t(`last-n-records`, { n: maxCount }) : ''} />
      )}
    </div>
  )
}
export default TxList
