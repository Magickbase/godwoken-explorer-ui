import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { gql } from 'graphql-request'
import { SIZES } from 'components/PageSize'
import Tooltip from 'components/Tooltip'
import HashLink from 'components/HashLink'
import Table from 'components/Table'
import Pagination from 'components/SimplePagination'
import TokenLogo from 'components/TokenLogo'
import FilterMenu from 'components/FilterMenu'
import RoundedAmount from 'components/RoundedAmount'
import SortIcon from 'assets/icons/sort.svg'
import ChangeIcon from 'assets/icons/change.svg'
import NoDataIcon from 'assets/icons/no-data.svg'
import EmptyFilteredListIcon from 'assets/icons/empty-filtered-list.svg'
import { GraphQLSchema, client } from 'utils'
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
    $limit: Int
    $log_index_sort: SortType
  ) {
    token_transfers(
      input: {
        transaction_hash: $transaction_hash
        before: $before
        after: $after
        from_address: $from_address
        to_address: $to_address
        combine_from_to: $combine_from_to
        limit: $limit
        sorter: [{ sort_type: $log_index_sort, sort_value: LOG_INDEX }]
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
  limit: number
  log_index_sort: 'ASC' | 'DESC'
}) =>
  client
    .request<TransferListProps>(transferListQuery, variables)
    .then(data => data.token_transfers)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

const FILTER_KEYS = ['address_from', 'address_to']

const TransferList: React.FC<TransferListProps> = ({ token_transfers: { entries, metadata } }) => {
  const [isShowLogo, setIsShowLogo] = useState(true)
  const [t] = useTranslation('list')
  const {
    query: { id: _, page_size = SIZES[1], log_index_sort = 'ASC', ...query },
    push,
    asPath,
  } = useRouter()

  const isFiltered = Object.keys(query).some(key => FILTER_KEYS.includes(key))

  const handleLogIndexSortClick = (e: React.MouseEvent<HTMLOrSVGImageElement>) => {
    const {
      dataset: { order },
    } = e.currentTarget
    push(
      `${asPath.split('?')[0] ?? ''}?${new URLSearchParams({
        ...query,
        log_index_sort: order === 'ASC' ? 'DESC' : 'ASC',
      })}`,
    )
  }

  const handleTokenDisplayChange = () => setIsShowLogo(show => !show)

  return (
    <div className={styles.container}>
      <Table>
        <thead>
          <tr>
            <th>
              <div className={styles.index}>
                {t(`log_index`)}
                <SortIcon onClick={handleLogIndexSortClick} data-order={log_index_sort} />
              </div>
            </th>
            <th>
              <div className={styles.from}>
                {t('from')}
                <FilterMenu filterKeys={[FILTER_KEYS[0]]} />
              </div>
            </th>
            <th>
              <div className={styles.to}>
                {t('to')}
                <FilterMenu filterKeys={[FILTER_KEYS[1]]} />
              </div>
            </th>
            <th className={styles.tokenLogo}>
              <div className={styles.token}>
                {t('token')}
                <ChangeIcon onClick={handleTokenDisplayChange} />
              </div>
            </th>
            <th>{`${t('value')}`}</th>
          </tr>
        </thead>
        <tbody>
          {metadata.total_count ? (
            entries.map(item => (
              <tr key={`${item.transaction_hash}-${item.log_index}`}>
                <td>{item.log_index}</td>
                <td className={styles.address}>
                  <Tooltip title={item.from_address} placement="top">
                    <span>
                      <HashLink
                        label={`${item.from_address.slice(0, 8)}...${item.from_address.slice(-8)}`}
                        href={`/account/${item.from_address}`}
                      />
                    </span>
                  </Tooltip>
                </td>
                <td className={styles.address}>
                  <Tooltip title={item.to_address} placement="top">
                    <span>
                      <HashLink
                        label={`${item.to_address.slice(0, 8)}...${item.to_address.slice(-8)}`}
                        href={`/account/${item.to_address}`}
                      />
                    </span>
                  </Tooltip>
                </td>
                <td className={styles.tokenLogo}>
                  <NextLink href={`/token/${item.udt.id}`}>
                    <a>
                      {isShowLogo ? (
                        <TokenLogo name={item.udt.name} logo={item.udt.icon} />
                      ) : (
                        item.udt.symbol.split('.')[0] ?? ''
                      )}
                    </a>
                  </NextLink>
                </td>
                <td title={item.udt.name}>
                  <RoundedAmount amount={item.amount} udt={item.udt} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>
                {isFiltered ? (
                  <div className={styles.noRecords}>
                    <EmptyFilteredListIcon />
                    <span>{t(`no_related_content`)}</span>
                  </div>
                ) : (
                  <div className={styles.noRecords}>
                    <NoDataIcon />
                    <span>{t(`no_records`)}</span>
                  </div>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {metadata.total_count ? <Pagination {...metadata} note={t(`last-n-records`, { n: `100k` })} /> : null}
    </div>
  )
}
export default TransferList
