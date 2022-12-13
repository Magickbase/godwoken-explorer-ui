import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { gql } from 'graphql-request'
import Table from 'components/Table'
import TxStatusIcon from '../TxStatusIcon'
import HashLink from 'components/HashLink'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/SimplePagination'
import TransferDirection from 'components/TransferDirection'
import FilterMenu from 'components/FilterMenu'
import AgeFilterMenu from 'components/FilterMenu/AgeFilterMenu'
import RoundedAmount from 'components/RoundedAmount'
import Tooltip from 'components/Tooltip'
import NoDataIcon from 'assets/icons/no-data.svg'
import EmptyFilteredListIcon from 'assets/icons/empty-filtered-list.svg'
import { timeDistance, GraphQLSchema, client, PCKB_UDT_INFO } from 'utils'
import styles from './styles.module.scss'

export type TxListProps = {
  transactions: {
    entries: Array<{
      hash: string
      eth_hash: string | null
      method_id: string | null
      method_name: string | null
      type: GraphQLSchema.TransactionType
      block?: Pick<GraphQLSchema.Block, 'hash' | 'number' | 'status' | 'timestamp'>
      from_account: Pick<GraphQLSchema.Account, 'eth_address' | 'script_hash' | 'type'>
      to_account: Pick<GraphQLSchema.Account, 'eth_address' | 'script_hash' | 'type'>
      polyjuice: Pick<GraphQLSchema.Polyjuice, 'value' | 'status' | 'native_transfer_address_hash'>
    }>
    metadata: GraphQLSchema.PageMetadata
  }
  viewer?: string
  blockNumber?: number
}

const txListQuery = gql`
  query txListQuery(
    $address_from: HashAddress
    $address_to: HashAddress
    $script_hash: HashFull
    $before: String
    $after: String
    $limit: Int
    $start_block_number: Int
    $end_block_number: Int
    $status: Status
    $age_range_start: DateTime
    $age_range_end: DateTime
    $method_id: String
    $method_name: String
    $combine_from_to: Boolean
  ) {
    transactions(
      input: {
        from_script_hash: $script_hash
        to_script_hash: $script_hash
        before: $before
        after: $after
        limit: $limit
        start_block_number: $start_block_number
        end_block_number: $end_block_number
        combine_from_to: $combine_from_to
        status: $status
        from_eth_address: $address_from
        to_eth_address: $address_to
        age_range_start: $age_range_start
        age_range_end: $age_range_end
        method_id: $method_id
        method_name: $method_name
      }
    ) {
      entries {
        hash
        eth_hash
        method_id
        method_name
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
          native_transfer_address_hash
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
type Status = 'PENDING' | 'ON_CHAINED' | null
interface Filter {
  limit?: number
  before: string
  after: string
  start_block_number?: number | null
  end_block_number?: number | null
  status?: Status
  address_from: string
  address_to: string
  age_range_start: string
  age_range_end: string
  method_id: string
  method_name: string
  combine_from_to: boolean
}
interface EthAccountTxListVariables extends Nullable<Filter> {
  address?: string | null
}
interface GwAccountTxListVariables extends Nullable<Filter> {
  script_hash?: string | null
}
interface BlockTxListVariables extends Nullable<Filter> {}
type Variables = Filter | EthAccountTxListVariables | GwAccountTxListVariables | BlockTxListVariables

export const fetchTxList = ({ status = 'ON_CHAINED', ...variables }: Variables) =>
  client
    .request<TxListProps>(txListQuery, { status, ...variables })
    .then(data => data.transactions)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

const FILTER_KEYS = [
  'block_from',
  'block_to',
  'method_id',
  'method_name',
  'address_from',
  'address_to',
  'age_range_start',
  'age_range_end',
]

const TxList: React.FC<TxListProps & { maxCount?: string; pageSize?: number }> = ({
  transactions: { entries, metadata },
  maxCount,
  pageSize,
  viewer,
  blockNumber,
}) => {
  const [t, { language }] = useTranslation('list')
  const { query } = useRouter()
  const isFiltered = Object.keys(query).some(key => FILTER_KEYS.includes(key))
  const isFilterUnnecessary = !metadata.total_count && !isFiltered

  return (
    <div className={styles.container} data-is-filter-unnecessary={isFilterUnnecessary}>
      <Table>
        <thead>
          <tr>
            <th>{t('txHash')}</th>
            <th>
              <div className={styles.methodHeader}>
                {t('method')}
                <FilterMenu filterKeys={[FILTER_KEYS[2], FILTER_KEYS[3]]} />
              </div>
            </th>
            <th>
              <div className={styles.blockHeader}>
                {t('block')}
                <FilterMenu filterKeys={[FILTER_KEYS[0], FILTER_KEYS[1]]} />
              </div>
            </th>
            <th>
              <div className={styles.ageHeader}>
                {t('age')}
                <AgeFilterMenu filterKeys={[FILTER_KEYS[6], FILTER_KEYS[7]]} />
              </div>
            </th>
            <th>
              <div className={styles.fromHeader}>
                {t('from')}
                <FilterMenu filterKeys={[FILTER_KEYS[4]]} />
              </div>
            </th>
            <th>
              <div className={styles.toHeader}>
                {t('to')}
                <FilterMenu filterKeys={[FILTER_KEYS[5]]} />
              </div>
            </th>
            <th className={styles.direction}></th>
            <th>{`${t('value')} (${PCKB_UDT_INFO.symbol})`}</th>
          </tr>
        </thead>
        <tbody>
          {metadata.total_count ? (
            entries.map(item => {
              const hash = item.eth_hash || item.hash
              const from = item.from_account?.eth_address || item.from_account?.script_hash || '-'
              let to = item.to_account?.eth_address || item.to_account?.script_hash || '-'
              let toType = item.to_account?.type

              if (item.polyjuice?.native_transfer_address_hash) {
                to = item.polyjuice.native_transfer_address_hash
                toType = GraphQLSchema.AccountType.EthUser
              }

              const method = item.method_name || item.method_id
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
                        status={item.block?.status}
                        isSuccess={
                          item.polyjuice ? item.polyjuice.status === GraphQLSchema.PolyjuiceStatus.Succeed : true
                        }
                      />
                    </div>
                  </td>
                  <td>
                    {method ? (
                      <Tooltip title={item.method_id} placement="top">
                        <div className={styles.method}>{method}</div>
                      </Tooltip>
                    ) : (
                      <div className={styles.method} data-is-native-transfer="true" />
                    )}
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
                    <Address address={from} type={item.from_account?.type} />
                  </td>
                  <td>
                    <Address address={to} type={toType} />
                  </td>
                  <td className={styles.direction}>
                    <TransferDirection from={from} to={to} viewer={viewer ?? ''} />
                  </td>
                  <td>
                    <RoundedAmount amount={item.polyjuice?.value ?? '0'} udt={PCKB_UDT_INFO} />
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={8} align="center">
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

      {!metadata.total_count ? null : pageSize ? (
        <Pagination {...metadata} note={maxCount ? t(`last-n-records`, { n: maxCount }) : ''} />
      ) : (
        <Pagination {...metadata} note={maxCount ? t(`last-n-records`, { n: maxCount }) : ''} />
      )}
    </div>
  )
}
export default TxList
