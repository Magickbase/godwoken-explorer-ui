import { gql } from 'graphql-request'
import BaseTransferlist, { TransferListProps } from 'components/BaseTransferlist'
import { client } from 'utils'

type ResponseProps = {
  erc721_token_transfers: TransferListProps
}

const transferListQueryForErc721 = gql`
  query ($to_address: String!, $limit: Int, $log_index_sort: SortType, $before: String, $after: String) {
    erc721_token_transfers(
      input: {
        to_address: $to_address
        limit: $limit
        before: $before
        after: $after
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
      }
      metadata {
        total_count
        before
        after
      }
    }
  }
`

export const fetchTransferListForErc721 = (variables: {
  to_address?: string | null
  limit: number
  before: string
  after: string
  log_index_sort: 'ASC' | 'DESC'
}) =>
  client
    .request(transferListQueryForErc721, variables)
    .then(data => data.erc721_token_transfers)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

const SimpleERC721Transferlist: React.FC<ResponseProps> = props => {
  const { erc721_token_transfers: dataSource } = props

  return <BaseTransferlist {...dataSource} />
}
export default SimpleERC721Transferlist
