import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { gql } from 'graphql-request'
import BigNumber from 'bignumber.js'
import Table from 'components/Table'
import Tooltip from 'components/Tooltip'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/SimplePagination'
import TxStatusIcon from 'components/TxStatusIcon'
import TransferDirection from 'components/TransferDirection'
import { client, timeDistance, getBlockStatus, GraphQLSchema } from 'utils'
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
      udt: Pick<GraphQLSchema.Udt, 'id' | 'decimal' | 'symbol'>
    }>
    metadata: GraphQLSchema.PageMetadata
  }
}

interface Cursor {
  limit?: number
  before: string
  after: string
}

interface AccountTransferListVariables extends Nullable<Cursor> {
  address: string
}

export interface TokenTransferListVariables extends Nullable<Cursor> {
  contract_address: string
}
type Variables = AccountTransferListVariables | TokenTransferListVariables

const transferListQuery = gql`
  query ($address: HashAddress, $before: String, $after: String, $limit: Int) {
    token_transfers(
      input: { from_address: $address, to_address: $address, before: $before, after: $after, limit: $limit }
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
  query ($address: HashAddress, $before: String, $after: String, $limit: Int) {
    token_transfers(input: { token_contract_address_hash: $address, before: $before, after: $after, limit: $limit }) {
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

const TransferList: React.FC<
  TransferListProps & {
    viewer?: string
  }
> = ({ token_transfers, viewer }) => {
  const [t, { language }] = useTranslation('list')

  return (
    <div className={styles.container}>
      <Table>
        <thead>
          <tr>
            <th>{t('txHash')}</th>
            <th>{t('block')} </th>
            <th>{t('age')} </th>
            <th>{t('from')}</th>
            <th>{t('to')}</th>
            <th>{`${t('value')}`}</th>
          </tr>
        </thead>
        <tbody>
          {token_transfers.metadata.total_count ? (
            token_transfers.entries.map(item => (
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
                      status={getBlockStatus(item.block.status)}
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
                <td>
                  <div style={{ display: 'flex', whiteSpace: 'nowrap' }}>
                    <TransferDirection from={item.from_address} to={item.to_address} viewer={viewer ?? ''} />
                    {`${new BigNumber(item.amount ?? 0).dividedBy(10 ** (item.udt?.decimal ?? 1)).toFormat()} ${
                      item.udt?.symbol ?? ''
                    }`}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} align="center" className={styles.noRecords}>
                {t(`no_records`)}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Pagination {...token_transfers.metadata} />
    </div>
  )
}
export default TransferList
