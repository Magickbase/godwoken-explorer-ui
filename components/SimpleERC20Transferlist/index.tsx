import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { gql } from 'graphql-request'
import { SIZES } from 'components/PageSize'
import Table from 'components/Table'
import Pagination from 'components/SimplePagination'
import TokenLogo from 'components/TokenLogo'
import FilterMenu from 'components/FilterMenu'
import SortIcon from 'assets/icons/sort.svg'
import { GraphQLSchema, client, formatAmount } from 'utils'
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

const TransferList: React.FC<TransferListProps> = ({ token_transfers: { entries, metadata } }) => {
  const [t] = useTranslation('list')
  const {
    query: { id: _, page_size = SIZES[1], log_index_sort = 'ASC', ...query },
    push,
    asPath,
  } = useRouter()

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
                <FilterMenu filterKeys={['address_from']} />
              </div>
            </th>
            <th>
              <div className={styles.to}>
                {t('to')}
                <FilterMenu filterKeys={['address_to']} />
              </div>
            </th>
            {/* <th className={styles.tokenLogo}>{t('token', { ns: 'common' })}</th> */}
            <th>{`${t('value')}`}</th>
          </tr>
        </thead>
        <tbody>
          {metadata.total_count ? (
            entries.map(item => (
              <tr key={`${item.transaction_hash}-${item.log_index}`}>
                <td>{item.log_index}</td>
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
                {/* <td className={styles.tokenLogo}> */}
                {/*   <NextLink href={`/token/${item.udt.id}`}> */}
                {/*     <TokenLogo name={item.udt.name} logo={item.udt.icon} /> */}
                {/*   </NextLink> */}
                {/* </td> */}
                <td title={item.udt.name}>{formatAmount(item.amount, item.udt)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center' }}>
                {t(`no_records`)}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Pagination {...metadata} pageSize={page_size as string} note={t(`last-n-records`, { n: `100k` })} />
    </div>
  )
}
export default TransferList
