import type { GetStaticPaths, GetStaticProps } from 'next'
import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Skeleton } from '@mui/material'
import { gql } from 'graphql-request'
import { ethers } from 'ethers'
import SubpageHead from 'components/SubpageHead'
import HashLink from 'components/HashLink'
import Tabs from 'components/Tabs'
import { SIZES } from 'components/PageSize'
import ActivityList, { fetchActivityList } from 'components/MultiTokenActivityList'
import InventoryList, { fetchInventoryListOfTokenItem as fetchInventoryList } from 'components/MultiTokenInventoryList'
import HolderList, { fetchItemHoldersList as fetchHolderList } from 'components/MultiTokenHolderList'
import Metadata from 'components/Metadata'
import CopyBtn from 'components/CopyBtn'
import { client, handleNftImageLoadError, erc1155ABI, provider, getIpfsUrl } from 'utils'
import styles from './styles.module.scss'

const infoQuery = gql`
  query ($address: HashAddress) {
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
  }
`

interface CollectionInfo {
  collection?: {
    name: string | null
    symbol: string | null
  }
  icon: string | null
  holder_count: number
  minted_count: number
}

interface InfoProps {
  erc1155_udts: {
    entries: Array<CollectionInfo>
  }
  udt?: {
    name: string | null
    symbol: string | null
  }
}

type MetadataProps = Record<'name' | 'description' | 'image', string>

interface Variables {
  address: string
}

const fetchInfo = (variables: Variables): Promise<CollectionInfo | undefined> =>
  client
    .request<InfoProps>(infoQuery, variables)
    .then(data => ({
      ...data.erc1155_udts.entries[0],
      collection: data.udt,
    }))
    .catch(() => undefined)

const tabs = ['activity', 'holders', 'inventory', 'metadata']

const MultiTokenItem = () => {
  const [t] = useTranslation('multi-token')
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const {
    query: { id, before = null, after = null, page_size = SIZES[1], tab = tabs[0] },
  } = useRouter()

  const [address, token_id] = Array.isArray(id) ? id : [null, null]

  useEffect(() => {
    if (!address || !token_id) return
    const contract = new ethers.Contract(address, erc1155ABI, provider)
    contract
      .uri(token_id)
      .then((url: string) => {
        return getIpfsUrl(url).replace(/{id}/, token_id)
      })
      .then((url: string) => fetch(url))
      .then(res => res.json())
      .then((metadata: MetadataProps) => setMetadata(metadata))
      .catch(console.warn)
  }, [address, token_id, setMetadata])

  const listParams = {
    address: address as string,
    token_id: token_id as string,
    before: before as string,
    after: after as string,
    limit: Number.isNaN(+page_size) ? +SIZES[1] : +page_size,
  }

  const { isLoading: isInfoLoading, data: info } = useQuery(
    ['multi-token-item-info', address],
    () => fetchInfo({ address }),
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
      enabled: address && token_id && tab === tabs[1],
    },
  )

  const { isLoading: isInventoryListLoading, data: inventoryList } = useQuery(
    ['multi-token-item-inventory', address, token_id, before, after, page_size],
    () => fetchInventoryList(listParams),
    {
      enabled: address && token_id && tab === tabs[2],
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

  // TODO: use name from metadata
  const title = `${t('multi-token-collection')} ${metadata?.name ?? info?.collection?.name ?? '-'}`

  return (
    <>
      <SubpageHead subtitle={title} />
      <div className={styles.container}>
        <div className={styles.overview}>
          <img
            src={getIpfsUrl(metadata?.image ?? '/images/nft-placeholder.svg')}
            onError={handleNftImageLoadError}
            alt="nft-cover"
          />
          <div className={styles.info}>
            {isInfoLoading ? (
              <Skeleton animation="wave" />
            ) : (
              <h2>
                <span>{info?.collection?.name || '-'}</span>
                {info?.collection?.name ? (
                  <NextLink href={`/multi-token-collection/${address}`}>
                    <a className={styles.collection}>
                      {`${info.collection.name}` + (info.collection.symbol ? `(${info.collection.symbol})` : '')}
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
            !isInventoryListLoading && inventoryList ? (
              <InventoryList inventory={inventoryList} />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === tabs[3] && metadata ? <Metadata {...metadata} /> : null}
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
