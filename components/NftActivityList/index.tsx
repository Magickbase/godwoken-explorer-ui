import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { gql } from 'graphql-request'
import Table from 'components/Table'
import Tooltip from 'components/Tooltip'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/SimplePagination'
import TxStatusIcon from 'components/TxStatusIcon'
import TransferDirection from 'components/TransferDirection'
import { client, timeDistance, getBlockStatus, GraphQLSchema } from 'utils'
import styles from './styles.module.scss'

// TODO: update empty list style after PR https://github.com/Magickbase/godwoken-explorer-ui/pull/417 is merged

export type NftActivityListProps = {
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
      method: string
      nft: {
        contract_address: string
        token_id: number
      }
    }>
    metadata: GraphQLSchema.PageMetadata
  }
}

interface Cursor {
  limit?: number
  before: string
  after: string
}

export interface TokenTransferListVariables extends Nullable<Cursor> {
  contract_address: string
}
type Variables = TokenTransferListVariables

const nftActivityListQuery = gql`
  query ($address: HashAddress, $before: String, $after: String, $limit: Int) {
    token_transfers(input: { token_contract_address_hash: $address, before: $before, after: $after, limit: $limit }) {
      entries {
        amount
        transaction_hash
        method
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
        nft {
          token_id
          contract_address
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

export const fetchNftActivityList = (variables: Variables) =>
  client.request<NftActivityListProps>(nftActivityListQuery, variables).then(data => data.token_transfers)

const NftActivityList: React.FC<
  NftActivityListProps & {
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
            <th>{t('method')} </th>
            <th>{t('age')} </th>
            <th>{t('from')}</th>
            <th>{t('to')}</th>
            <th className={styles.direction}></th>
            <th>{`${t('token_id')}`}</th>
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
                        status={getBlockStatus(item.block.status)}
                        isSuccess={item.polyjuice.status === GraphQLSchema.PolyjuiceStatus.Succeed}
                      />
                    </div>
                  </td>
                  <td>{item.method}</td>
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
                  <td>
                    <NextLink href={`/nft-collection/${item.nft.contract_address}/${item.nft.token_id}`}>
                      <a>{(+item.nft.token_id).toLocaleString('en')}</a>
                    </NextLink>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={6} className={styles.noRecords}>
                {t(`no_records`)}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Pagination {...token_transfers.metadata} note={t(`last-n-records`, { n: '10k' })} />
    </div>
  )
}
export default NftActivityList
