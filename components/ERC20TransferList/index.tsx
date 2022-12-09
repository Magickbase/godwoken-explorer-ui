import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { gql } from 'graphql-request'
import Table from 'components/Table'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/SimplePagination'
import TxStatusIcon from 'components/TxStatusIcon'
import TransferDirection from 'components/TransferDirection'
import RoundedAmount from 'components/RoundedAmount'
import TokenLogo from 'components/TokenLogo'
import Tooltip from 'components/Tooltip'
import FilterMenu from 'components/FilterMenu'
import AgeFilterMenu from 'components/FilterMenu/AgeFilterMenu'
import ChangeIcon from 'assets/icons/change.svg'
import NoDataIcon from 'assets/icons/no-data.svg'
import { client, timeDistance, GraphQLSchema } from 'utils'
import styles from './styles.module.scss'

export type TransferListProps = {
  token_transfers: {
    entries: Array<{
      amount: string
      block: Pick<GraphQLSchema.Block, 'number' | 'status' | 'timestamp'>
      from_address: string
      to_address: string
      from_account: Pick<GraphQLSchema.Account, 'type'>
      to_account: Pick<GraphQLSchema.Account, 'type'>
      log_index: number
      polyjuice: Pick<GraphQLSchema.Polyjuice, 'status'>
      transaction_hash: string
      udt: Pick<GraphQLSchema.Udt, 'id' | 'decimal' | 'symbol' | 'icon' | 'name'>
    }>
    metadata: GraphQLSchema.PageMetadata
  }
}

interface FilterAndCursor {
  limit?: number
  before: string
  after: string
  block_from?: number | null
  block_to?: number | null
  address_from: string
  address_to: string
  age_range_start: string
  age_range_end: string
  combine_from_to: boolean
}

interface AccountTransferListVariables extends Nullable<FilterAndCursor> {}

export interface TokenTransferListVariables extends Nullable<FilterAndCursor> {
  contract_address: string
}
type Variables = AccountTransferListVariables | TokenTransferListVariables

const transferListQuery = gql`
  query transferListQuery(
    $before: String
    $after: String
    $limit: Int
    $block_from: Int
    $block_to: Int
    $address_from: HashAddress
    $address_to: HashAddress
    $age_range_start: DateTime
    $age_range_end: DateTime
    $combine_from_to: Boolean
  ) {
    token_transfers(
      input: {
        before: $before
        after: $after
        limit: $limit
        start_block_number: $block_from
        end_block_number: $block_to
        from_address: $address_from
        to_address: $address_to
        age_range_start: $age_range_start
        age_range_end: $age_range_end
        combine_from_to: $combine_from_to
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
        from_account {
          type
        }
        to_account {
          type
        }
        block {
          number
          timestamp
          status
        }
        udt {
          id
          decimal
          symbol
          icon
          name
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

// FIXME: a patch because API returns 500 if from, to, contract_address are specified simultaneously
const tokenTransferListQuery = gql`
  query tokenTransferListQuery(
    $contract_address: HashAddress
    $before: String
    $after: String
    $limit: Int
    $block_from: Int
    $block_to: Int
    $address_from: HashAddress
    $address_to: HashAddress
    $age_range_start: DateTime
    $age_range_end: DateTime
    $combine_from_to: Boolean
  ) {
    token_transfers(
      input: {
        token_contract_address_hash: $contract_address
        before: $before
        after: $after
        limit: $limit
        start_block_number: $block_from
        end_block_number: $block_to
        from_address: $address_from
        to_address: $address_to
        age_range_start: $age_range_start
        age_range_end: $age_range_end
        combine_from_to: $combine_from_to
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
        from_account {
          type
        }
        to_account {
          type
        }
        block {
          number
          timestamp
          status
        }
        udt {
          id
          decimal
          symbol
          icon
          name
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

export const fetchTransferList = (variables: Variables) =>
  client.request<TransferListProps>(transferListQuery, variables).then(data => data.token_transfers)

export const fetchTokenTransferList = (variables: Variables) =>
  client.request<TransferListProps>(tokenTransferListQuery, variables).then(data => data.token_transfers)

const FILTER_KEYS = ['block_from', 'block_to', 'address_from', 'address_to', 'age_range_start', 'age_range_end']

const TransferList: React.FC<
  TransferListProps & {
    viewer?: string
    showToken?: boolean
  }
> = ({ token_transfers, viewer, showToken = true }) => {
  const [isShowLogo, setIsShowLogo] = useState(true)
  const [t, { language }] = useTranslation('list')
  const { query } = useRouter()

  const isFiltered = Object.keys(query).some(key => FILTER_KEYS.includes(key))
  const isFilterUnnecessary = !token_transfers.metadata.total_count && !isFiltered

  const handleTokenDisplayChange = () => setIsShowLogo(show => !show)

  return (
    <div className={styles.container} data-is-filter-unnecessary={isFilterUnnecessary}>
      <Table>
        <thead>
          <tr>
            <th>{t('txHash')}</th>
            <th>
              <div className={styles.blockHeader}>
                {t('block')}
                <FilterMenu filterKeys={[FILTER_KEYS[0], FILTER_KEYS[1]]} />
              </div>
            </th>
            <th>
              <div className={styles.ageHeader}>
                {t('age')}
                <AgeFilterMenu filterKeys={[FILTER_KEYS[4], FILTER_KEYS[5]]} />
              </div>
            </th>
            <th>
              <div className={styles.fromHeader}>
                {t('from')}
                <FilterMenu filterKeys={[FILTER_KEYS[2]]} />
              </div>
            </th>
            <th>
              <div className={styles.toHeader}>
                {t('to')}
                <FilterMenu filterKeys={[FILTER_KEYS[3]]} />
              </div>
            </th>
            <th className={styles.direction}></th>
            {showToken ? (
              <th>
                <div className={styles.tokenHeader}>
                  {t('token')}
                  <ChangeIcon onClick={handleTokenDisplayChange} />
                </div>
              </th>
            ) : null}
            <th>{`${t('value')}`}</th>
          </tr>
        </thead>
        <tbody>
          {token_transfers.metadata.total_count ? (
            token_transfers.entries.map(item => {
              return (
                <tr key={item.transaction_hash + item.log_index}>
                  <td>
                    <div className={styles.hash}>
                      <Tooltip title={item.transaction_hash} placement="top">
                        <span>
                          <NextLink href={`/tx/${item.transaction_hash}`}>
                            <a className="mono-font">{`${item.transaction_hash.slice(
                              0,
                              8,
                            )}...${item.transaction_hash.slice(-8)}`}</a>
                          </NextLink>
                        </span>
                      </Tooltip>
                      <TxStatusIcon
                        status={item.block.status}
                        isSuccess={item.polyjuice.status === GraphQLSchema.PolyjuiceStatus.Succeed}
                      />
                    </div>
                  </td>
                  <td>
                    <NextLink href={`/block/${item.block.number}`}>
                      <a>{(+item.block.number).toLocaleString('en')}</a>
                    </NextLink>
                  </td>
                  <td>
                    <time dateTime={item.block.timestamp}>
                      {timeDistance(new Date(item.block.timestamp).getTime(), language)}
                    </time>
                  </td>
                  <td>
                    <Address address={item.from_address} type={item.from_account?.type} />
                  </td>
                  <td>
                    <Address address={item.to_address} type={item.to_account?.type} />
                  </td>
                  <td className={styles.direction}>
                    <TransferDirection from={item.from_address} to={item.to_address} viewer={viewer ?? ''} />
                  </td>
                  {showToken ? (
                    <td>
                      <NextLink href={`/token/${item.udt.id}`}>
                        <a className={isShowLogo ? undefined : styles.tokenUrl}>
                          {isShowLogo ? (
                            <TokenLogo name={item.udt?.name} logo={item.udt?.icon} />
                          ) : (
                            item.udt?.symbol.split('.')[0]
                          )}
                        </a>
                      </NextLink>
                    </td>
                  ) : null}
                  <td>
                    <RoundedAmount amount={item.amount} udt={item.udt} />
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={showToken ? 8 : 7}>
                <div className={styles.noRecords}>
                  <NoDataIcon />
                  <span>{t(`no_records`)}</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {token_transfers.metadata.total_count ? <Pagination {...token_transfers.metadata} /> : null}
    </div>
  )
}
export default TransferList
