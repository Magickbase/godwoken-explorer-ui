import { useTranslation } from 'next-i18next'
import { gql } from 'graphql-request'
import Table from 'components/Table'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/SimplePagination'
import NoDataIcon from 'assets/icons/no-data.svg'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { client, GraphQLSchema } from 'utils'

import styles from './styles.module.scss'

export type HolderListProps = {
  holders: {
    entries: Array<{
      rank: number
      address_hash: string
      quantity: number
      account: Pick<GraphQLSchema.Account, 'bit_alias' | 'eth_address'>
    }>
    metadata: GraphQLSchema.PageMetadata
  }
}

const holderFragment = gql`
  fragment holders on PaginateErc721Erc1155Holders {
    entries {
      rank
      address_hash
      quantity
      account {
        bit_alias
        eth_address
      }
    }
    metadata {
      before
      after
      total_count
    }
  }
`

const collectionHolderListQuery = gql`
  ${holderFragment}
  query ($address: HashAddress!, $before: String, $after: String, $limit: Int) {
    holders: erc1155_holders(input: { contract_address: $address, before: $before, after: $after, limit: $limit }) {
      ...holders
    }
  }
`

const itemHolderListQuery = gql`
  query ($address: HashAddress!, $token_id: Decimal, $before: String, $after: String, $limit: Int) {
    holders: erc1155_holders(
      input: { contract_address: $address, token_id: $token_id, before: $before, after: $after, limit: $limit }
    ) {
      entries {
        rank
        address_hash
        quantity
        account {
          bit_alias
          eth_address
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

interface Variables {
  address: string // nft collection contract address
  before: string | null
  after: string | null
  limit: number
}

interface ItemHoldersVariables extends Variables {
  token_id: string
}

export const fetchHoldersList = (variables: Variables) =>
  client
    .request<HolderListProps>(collectionHolderListQuery, variables)
    .then(data => data.holders)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

export const fetchItemHoldersList = (variables: ItemHoldersVariables): Promise<HolderListProps['holders']> =>
  client
    .request<HolderListProps>(itemHolderListQuery, variables)
    .then(data => data.holders)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

const MultiTokenHolderList: React.FC<HolderListProps> = ({ holders }) => {
  const [t] = useTranslation('list')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <>
      <Table>
        <thead style={{ textTransform: 'capitalize' }}>
          <tr>
            <th>{t('rank')}</th>
            <th>{t('address')} </th>
            <th>{t('quantity')}</th>
          </tr>
        </thead>
        <tbody>
          {holders?.metadata.total_count ? (
            holders.entries.map(item => {
              const address = item.account?.eth_address
              const domain = item.account?.bit_alias

              return (
                <tr key={address}>
                  <td>{item.rank}</td>
                  <td className={styles.address}>
                    <Address address={address} domain={domain} leading={!isMobile ? 22 : 8} />
                  </td>
                  <td>{(+item.quantity).toLocaleString('en')}</td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={3}>
                <div className={styles.noRecords}>
                  <NoDataIcon />
                  <span>{t(`no_records`)}</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {!holders?.metadata.total_count ? null : (
        <Pagination {...holders.metadata} note={t(`last-n-records`, { n: '100k' })} />
      )}
    </>
  )
}

export default MultiTokenHolderList
