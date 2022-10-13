import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { gql } from 'graphql-request'
import Pagination from 'components/SimplePagination'
import HashLink from 'components/HashLink'
import NoDataIcon from 'assets/icons/no-data.svg'
import { client, GraphQLSchema, handleNftImageLoadError } from 'utils'
import styles from './styles.module.scss'

type InventoryListProps = {
  inventory: {
    entries: Array<{
      token_id: string
      address_hash: string
      token_contract_address_hash: string
      udt: {
        id: number
        name: string | null
        icon: string | null
      }
      value: string
    }>
    metadata: GraphQLSchema.PageMetadata
  }
  viewer?: string
}

const inventoryListOfCollectionQuery = gql`
  query ($address: HashAddress!, $before: String, $after: String, $limit: Int) {
    inventory: erc721_erc1155_inventory(
      input: { contract_address: $address, before: $before, after: $after, limit: $limit }
    ) {
      entries {
        token_id
        address_hash
        token_contract_address_hash
        udt {
          id
          name
          icon
        }
        value
      }
      metadata {
        before
        after
        total_count
      }
    }
  }
`

const inventoryListOfAccountQuery = gql`
  query ($address: HashAddress!, $before: String, $after: String, $limit: Int) {
    inventory: user_erc1155_assets(input: { user_address: $address, before: $before, after: $after, limit: $limit }) {
      entries {
        token_id
        token_contract_address_hash
        udt {
          name
          icon
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

export const fetchInventoryListOfAccount = (variables: Variables) =>
  client
    .request<InventoryListProps>(inventoryListOfAccountQuery, variables)
    .then(data => data.inventory)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

const NFTInventoryList: React.FC<InventoryListProps> = ({ inventory, viewer }) => {
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
        {inventory.entries.map(item => (
          <div key={item.token_id} className={styles.card}>
            <NextLink href={`/multi-token-item/${item.token_contract_address_hash}/${item.token_id}`}>
              <a className={styles.cover}>
                <img
                  src={item.udt?.icon ?? '/images/nft-placeholder.svg'}
                  onError={handleNftImageLoadError}
                  alt="nft-cover"
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
                <span>{(+item.value || 0).toLocaleString('en')}</span>
              </div>
            )}

            <div className={styles.info}>
              <span>{t('token-id')}</span>
              <HashLink
                label={item.token_id}
                href={`/multi-token-item/${item.token_contract_address_hash}/${item.token_id}`}
                monoFont={false}
                style={{ fontSize: 14 }}
              />
            </div>
          </div>
        ))}
      </div>

      {inventory.metadata.total_count ? <Pagination {...inventory.metadata} /> : null}
    </>
  )
}

export default NFTInventoryList
