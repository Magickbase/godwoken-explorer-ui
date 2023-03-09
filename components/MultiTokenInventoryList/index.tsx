import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { gql } from 'graphql-request'
import Pagination from 'components/SimplePagination'
import HashLink from 'components/HashLink'
import Tooltip from 'components/Tooltip'
import Address from 'components/TruncatedAddress'
import NoDataIcon from 'assets/icons/no-data.svg'
import { client, getIpfsUrl, GraphQLSchema, handleNftImageLoadError } from 'utils'
import styles from './styles.module.scss'

type InventoryListProps = {
  inventory: {
    entries: Array<{
      token_id: string
      contract_address_hash: string
      counts: string
      owner?: {
        account: Pick<GraphQLSchema.Account, 'bit_alias' | 'eth_address'>
      }
      udt?: {
        id: number
        name: string | null
        icon: string | null
      }
      token_instance?: {
        metadata?: Record<'image', string>
      }
    }>
    metadata: GraphQLSchema.PageMetadata
  }
  viewer?: string
  token_id?: string
}

const CollectionFragment = gql`
  fragment collectionOrItemList on PaginateErc1155Inventory {
    entries {
      token_id
      contract_address_hash
      counts
      token_instance {
        metadata
      }
    }
    metadata {
      before
      after
      total_count
    }
  }
`

const inventoryListOfCollectionQuery = gql`
  ${CollectionFragment}
  query ($address: HashAddress!, $before: String, $after: String, $limit: Int) {
    inventory: erc1155_inventory(input: { contract_address: $address, before: $before, after: $after, limit: $limit }) {
      ...collectionOrItemList
    }
  }
`

const inventoryListOfAccountQuery = gql`
  query ($address: HashAddress!, $before: String, $after: String, $limit: Int) {
    inventory: user_erc1155_assets(input: { user_address: $address, before: $before, after: $after, limit: $limit }) {
      entries {
        token_id
        contract_address_hash: token_contract_address_hash
        udt {
          name
          icon
        }
        token_instance {
          metadata
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

interface Variables {
  address: string
  before: string | null
  after: string | null
  limit: number
}

export const fetchInventoryListOfCollection = (variables: Variables) =>
  client
    .request<InventoryListProps>(inventoryListOfCollectionQuery, variables)
    .then(data => data.inventory)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

/*
 * For erc 1155, a token type's inventory is same as its holder list because token items belong to a token type are fungible tokens
 * So query of holder list will be used instead
 */

export const fetchInventoryListOfAccount = (variables: Variables) =>
  client
    .request<InventoryListProps>(inventoryListOfAccountQuery, variables)
    .then(data => data.inventory)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

const MultiTokenInventoryList: React.FC<InventoryListProps> = ({ inventory, viewer, token_id }) => {
  const [t] = useTranslation(['multi-token', 'list'])
  if (!inventory?.metadata.total_count) {
    return (
      <div>
        <div className={styles.noRecords}>
          <NoDataIcon />
          <span>{t(`no_records`, { ns: 'list' })}</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={styles.container}>
        {inventory.entries.map((item, idx) => {
          const {
            owner: {
              account: { bit_alias, eth_address },
            },
          } = item

          return (
            <div key={item.token_id + idx} className={styles.card}>
              <NextLink href={`/multi-token-item/${item.contract_address_hash}/${item.token_id}`}>
                <a className={styles.cover}>
                  <img
                    src={getIpfsUrl(item.token_instance?.metadata?.image) ?? '/images/nft-placeholder.svg'}
                    onError={handleNftImageLoadError}
                    alt="nft-cover"
                    loading="lazy"
                  />
                </a>
              </NextLink>

              {viewer ? (
                <div className={styles.info}>
                  <span>{t('name')}</span>
                  <span>{item.udt.name?.length > 15 ? item.udt.name.slice(0, 15) + '...' : item.udt.name || '-'}</span>
                </div>
              ) : (
                <div className={styles.info}>
                  <span>{t('quantity')}</span>
                  <span>{(+item.counts || 0).toLocaleString('en')}</span>
                </div>
              )}

              {token_id ? (
                <div className={styles.info}>
                  <span>{t('owner')}</span>
                  <Address address={eth_address} domain={bit_alias} />
                </div>
              ) : (
                <div className={styles.info}>
                  <span>{t('token-id')}</span>
                  <HashLink
                    label={item.token_id}
                    href={`/multi-token-item/${item.contract_address_hash}/${item.token_id}`}
                    monoFont={false}
                    style={{ fontSize: 14 }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {inventory.metadata.total_count ? <Pagination {...inventory.metadata} /> : null}
    </>
  )
}

export default MultiTokenInventoryList
