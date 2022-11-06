import type { GetStaticPaths, GetStaticProps } from 'next'
import { useQuery } from 'react-query'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Skeleton } from '@mui/material'
import { gql } from 'graphql-request'
import SubpageHead from 'components/SubpageHead'
import HashLink from 'components/HashLink'
import Tabs from 'components/Tabs'
import { SIZES } from 'components/PageSize'
import ActivityList, { fetchActivityList } from 'components/MultiTokenActivityList'
import InventoryList from 'components/MultiTokenInventoryList'
import HolderList, { fetchItemHoldersList as fetchHolderList } from 'components/MultiTokenHolderList'
import Metadata from 'components/Metadata'
import CopyBtn from 'components/CopyBtn'
import { client, handleNftImageLoadError, getIpfsUrl, GraphQLSchema } from 'utils'
import styles from './styles.module.scss'

const infoQuery = gql`
  query ($address: HashAddress, $token_id: String) {
    erc1155_udts(input: { contract_address: $address, limit: 1 }) {
      entries {
        name
        symbol
        icon
        holders_count
        minted_count
      }
    }

    udt(input: { contract_address: $address }) {
      symbol
      name
    }
    holders: erc1155_inventory(input: { contract_address: $address, token_id: $token_id }) {
      entries {
        token_instance {
          metadata
        }
      }
    }
  }
`

type MetadataProps = Record<'name' | 'description' | 'image', string>
interface CollectionInfo
  extends Pick<
    GraphQLSchema.MultiTokenCollectionListItem,
    'icon' | 'holders_count' | 'minted_count' | 'token_type_count'
  > {
  collection?: {
    name: string | null
    symbol: string | null
  }
  metadata?: MetadataProps
}
interface InfoProps {
  erc1155_udts: {
    entries: Array<CollectionInfo>
  }
  udt?: {
    name: string | null
    symbol: string | null
  }
  holders?: {
    entries: Array<{ token_instance: Record<string, any> }>
  }
}
interface Variables {
  address: string
  token_id: string
}

const tabs = ['activity', 'holders', 'inventory', 'metadata']

const fetchInfo = (variables: Variables): Promise<CollectionInfo | undefined> =>
  client
    .request<InfoProps>(infoQuery, variables)
    .then(data => ({
      ...data.erc1155_udts.entries[0],
      collection: data.udt,
      metadata: data.holders.entries[0]?.token_instance.metadata,
    }))
    .catch(() => undefined)

const MultiTokenItem = () => {
  const [t] = useTranslation('multi-token')
  const {
    query: { id, before = null, after = null, page_size = SIZES[1], tab = tabs[0] },
  } = useRouter()
  const [address, token_id] = Array.isArray(id) ? id : [null, null]

  const listParams = {
    address: address as string,
    token_id: token_id as string,
    before: before as string,
    after: after as string,
    limit: Number.isNaN(+page_size) ? +SIZES[1] : +page_size,
  }

  const { isLoading: isInfoLoading, data: info = {} } = useQuery(
    ['multi-token-item-info', address],
    () => fetchInfo({ address, token_id }),
    {
      enabled: !!address && !!token_id,
      refetchInterval: 10000,
    },
  )

  const { isLoading: isActivityListLoading, data: activityList } = useQuery(
    ['multi-token-item-activity', address, token_id, before, after, page_size],
    () => fetchActivityList(listParams),
    {
      enabled: address && token_id && tab === tabs[0],
    },
  )

  const { isLoading: isHolderListLoading, data: holderList } = useQuery(
    ['multi-token-item-holders', address, token_id, before, after, page_size],
    () => fetchHolderList(listParams),
    {
      enabled: address && token_id && (tab === tabs[1] || tab === tabs[2]),
    },
  )

  const infoList: Array<{
    field: string
    content: React.ReactNode | string
  }> = [
    {
      field: t('contract'),
      content: (
        <div>
          <HashLink label={address as string} href={`/account/${address}`} />
          <CopyBtn content={address as string} field={t('address', { ns: 'common' })} />
        </div>
      ),
    },
    {
      field: t('token-id'),
      content: (
        <div>
          {token_id}
          <CopyBtn content={token_id as string} field={t('token-id', { ns: 'common' })} />
        </div>
      ),
    },
    {
      field: t('type'),
      content: t('erc-1155'),
    },
  ]

  const { metadata = {}, collection } = info as CollectionInfo
  const { image: imageUrl = '', name = '' } = metadata as MetadataProps

  const title = `${t('multi-token-collection')} ${name ?? collection?.name ?? '-'}`

  return (
    <>
      <SubpageHead subtitle={title} />
      <div className={styles.container}>
        <div className={styles.overview}>
          <img
            src={getIpfsUrl(imageUrl ?? '/images/nft-placeholder.svg')}
            onError={handleNftImageLoadError}
            alt="nft-cover"
          />
          <div className={styles.info}>
            {isInfoLoading ? (
              <Skeleton animation="wave" />
            ) : (
              <h2>
                <span>{name || '-'}</span>
                {collection?.name ? (
                  <NextLink href={`/multi-token-collection/${address}`}>
                    <a className={styles.collection}>
                      {`${collection?.name}` + (collection?.symbol ? `(${collection?.symbol})` : '')}
                    </a>
                  </NextLink>
                ) : null}
              </h2>
            )}
            {infoList.map(({ field, content }, i) => (
              <div key={i} className={styles.item}>
                <div>{field}</div>
                <div>{content}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.list}>
          <Tabs
            value={tabs.indexOf(tab as string)}
            tabs={tabs.slice(0, metadata ? undefined : -1).map((tabItem, idx) => ({
              label: t(tabItem),
              href: `/multi-token-item/${address}/${token_id}?tab=${tabs[idx]}`,
            }))}
          />

          {tab === tabs[0] ? (
            !isActivityListLoading && activityList ? (
              <ActivityList transfers={activityList} token_id={token_id} />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}

          {tab === tabs[1] ? (
            !isHolderListLoading && holderList ? (
              <HolderList holders={holderList} />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}

          {tab === tabs[2] ? (
            !isHolderListLoading && holderList ? (
              <InventoryList
                token_id={token_id}
                inventory={{
                  entries: holderList.entries.map(item => ({
                    token_id,
                    contract_address_hash: address,
                    counts: item.quantity.toString(),
                    owner: item.address_hash,
                    token_instance: {
                      metadata: {
                        image: imageUrl,
                      },
                    },
                  })),
                  metadata: holderList.metadata,
                }}
              />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === tabs[3] && metadata ? <Metadata {...(metadata as MetadataProps)} /> : null}
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: 'blocking',
})

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common', 'multi-token', 'list'])
  return { props: lng }
}

export default MultiTokenItem
