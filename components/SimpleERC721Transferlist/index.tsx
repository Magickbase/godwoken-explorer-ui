import CommonTransferlist, { TransferListProps } from 'components/CommonTransferlist'
import { gql } from 'graphql-request'
import { client } from 'utils'

type ResponseProps = {
  erc721_token_transfers: TransferListProps & {
    token_contract_address_hash: string
    token_id: number
  }
}

const transferListQueryForErc721 = gql`
  query (
    $from_address: String
    $to_address: String!
    $limit: Int
    $before: String
    $after: String
    $log_index_sort: SortType
  ) {
    erc721_token_transfers(
      input: {
        from_address: $from_address
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

export const fetchTransferListForErc721 = (variables: {
  limit: number
  before: string
  after: string
  from_address?: string | null
  to_address: string | null
  log_index_sort: 'ASC' | 'DESC'
}) =>
  client
    .request(transferListQueryForErc721, variables)
    .then(data => data.erc721_token_transfers)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

const SimpleERC721Transferlist: React.FC<ResponseProps> = props => {
  const { erc721_token_transfers: dataSource } = props
  const handleTokenName = udt => `${udt.name}#${udt.id}`

  return <CommonTransferlist {...dataSource} handleTokenName={handleTokenName} />
}
export default SimpleERC721Transferlist
