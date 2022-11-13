import BaseTransferlist, { TransferListProps } from 'components/BaseTransferlist'
import { gql } from 'graphql-request'
import { client } from 'utils'

type ResponseProps = {
  erc1155_token_transfers: TransferListProps & {
    token_contract_address_hash: string
    token_id: number
  }
}

const transferListQueryForErc1155 = gql`
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
    erc1155_token_transfers(
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
        transaction_hash
        log_index
        from_address
        to_address
        udt {
          decimal
          name
          icon
          symbol
          id
        }
        token_id
        token_ids
        token_contract_address_hash
      }
      metadata {
        total_count
        before
        after
      }
    }
  }
`

export const fetchTransferListForErc1155 = (variables: {
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
    .request(transferListQueryForErc1155, variables)
    .then(data => data.erc1155_token_transfers)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

const SimpleERC1155Transferlist: React.FC<ResponseProps> = props => {
  const { erc1155_token_transfers: dataSource } = props
  const handleTokenName = (udt, token_id) => `${udt.name}#${token_id}`

  return <BaseTransferlist {...dataSource} handleTokenName={handleTokenName} />
}
export default SimpleERC1155Transferlist
