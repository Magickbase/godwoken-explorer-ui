import BaseTransferlist, { TransferListProps } from 'components/BaseTransferlist'
import { gql } from 'graphql-request'
import { client, GraphQLSchema } from 'utils'

export enum TransferlistType {
  'Erc20' = 'Erc20',
  'Erc721' = 'Erc721',
  'Erc1155' = 'Erc1155',
}

type Erc20ResponseProps = {
  token_transfers: TransferListProps & {
    block: Nullable<Pick<GraphQLSchema.Block, 'number' | 'timestamp'>>
  }
}
type Erc721ResponseProps = {
  erc721_token_transfers: TransferListProps & {
    token_contract_address_hash: string
    token_id: number
  }
}
type Erc1155ResponseProps = {
  erc1155_token_transfers: TransferListProps & {
    token_contract_address_hash: string
    token_id: number
  }
}

export type CommonERCTransferlistProps = {
  transferlistType: TransferlistType
  [propName: string]: any
}

const apiNameMap = {
  Erc20: 'token_transfers',
  Erc721: 'erc721_token_transfers',
  Erc1155: 'erc1155_token_transfers',
}

const getTransferListQuery = (type: TransferlistType) => gql`
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
    ${apiNameMap[type]}(
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

export const fetchERCTransferList = (
  variables: {
    transaction_hash: string
    before: string | null
    after: string | null
    from_address?: string | null
    to_address?: string | null
    combine_from_to?: boolean | null
    limit: number
    log_index_sort: 'ASC' | 'DESC'
  },
  type,
) =>
  client
    .request(getTransferListQuery(type), variables)
    .then(data => data[`${apiNameMap[type]}`])
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

const SimpleERC20Transferlist: React.FC<Erc20ResponseProps> = props => {
  const { token_transfers: dataSource } = props
  const handleTokenName = udt => udt.symbol.split('.')[0] || ''

  return <BaseTransferlist {...dataSource} handleTokenName={handleTokenName} isShowValue />
}

const SimpleERC721Transferlist: React.FC<Erc721ResponseProps> = props => {
  const { erc721_token_transfers: dataSource } = props
  const handleTokenName = (udt, token_id) => `${udt.name}#${token_id}`

  return <BaseTransferlist {...dataSource} handleTokenName={handleTokenName} />
}

const SimpleERC1155Transferlist: React.FC<Erc1155ResponseProps> = props => {
  const { erc1155_token_transfers: dataSource } = props
  const handleTokenName = (udt, token_id) => `${udt.name}#${token_id}`

  return <BaseTransferlist {...dataSource} handleTokenName={handleTokenName} />
}

const CommonERCTransferlist: React.FC<any> = props => {
  const { transferlistType = TransferlistType.Erc20, ...resData } = props

  switch (transferlistType) {
    case TransferlistType.Erc20:
      return <SimpleERC20Transferlist {...resData} />
    case TransferlistType.Erc721:
      return <SimpleERC721Transferlist {...resData} />
    case TransferlistType.Erc1155:
      return <SimpleERC1155Transferlist {...resData} />
    default:
      return null
  }
}

export default CommonERCTransferlist
