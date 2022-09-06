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
import Tooltip from 'components/Tooltip'
import FilterMenu from 'components/FilterMenu'
import RoundedAmount from 'components/RoundedAmount'
import NoDataIcon from 'assets/icons/no-data.svg'
import EmptyFilteredListIcon from 'assets/icons/empty-filtered-list.svg'
import { getBlockStatus, timeDistance, GraphQLSchema, client, PCKB_UDT_INFO } from 'utils'
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
    $status: Status
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
        status: $status
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

const FILTER_KEYS = ['block_from', 'block_to']

const TxList: React.FC<TxListProps & { maxCount?: string; pageSize?: number }> = ({
  transactions: { entries, metadata },
  maxCount,
  pageSize,
  viewer,
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
            <th>{t('method')}</th>
            <th>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {t('block')}
                <FilterMenu filterKeys={FILTER_KEYS} />
              </div>
            </th>
            <th>{t('age')}</th>
            <th>{t('from')}</th>
            <th>{t('to')}</th>
            <th className={styles.direction}></th>
            <th>{`${t('value')} (${PCKB_UDT_INFO.symbol})`}</th>
          </tr>
        </thead>
        <tbody>
          {metadata.total_count ? (
            entries.map(item => {
              const hash = item.eth_hash || item.hash
              const from = item.from_account.eth_address || item.from_account.script_hash
              const to = item.to_account?.eth_address || item.to_account?.script_hash || '-'
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
                        status={getBlockStatus(item.block?.status ?? GraphQLSchema.BlockStatus.Pending)}
                        isSuccess={
                          item.polyjuice ? item.polyjuice.status === GraphQLSchema.PolyjuiceStatus.Succeed : true
                        }
                      />
                    </div>
                  </td>
                  <td>
                    {method ? (
                      <Tooltip title={item.method_id} placement="top">
                        <div className={styles.method} title={method}>
                          {method}
                        </div>
                      </Tooltip>
                    ) : (
                      '-'
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
                    <Address address={to} type={item.to_account?.type} />
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
