import { gql } from 'graphql-request'
import CommonTransferlist, { TransferListProps } from 'components/CommonTransferlist'
import { GraphQLSchema, client } from 'utils'

type ResponseProps = {
  token_transfers: TransferListProps & {
    block: Nullable<Pick<GraphQLSchema.Block, 'number' | 'timestamp'>>
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
    .request(transferListQuery, variables)
    .then(data => data.token_transfers)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

const TransferList: React.FC<ResponseProps> = props => {
  const { token_transfers: dataSource } = props
  const handleTokenName = udt => udt.symbol.split('.')[0] || ''

  return <CommonTransferlist {...dataSource} isShowValue handleTokenName={handleTokenName} />
}
export default TransferList
