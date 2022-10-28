import type { GetStaticPaths, GetStaticProps } from 'next'
import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Skeleton } from '@mui/material'
import SubpageHead from 'components/SubpageHead'
import HashLink from 'components/HashLink'
import Tabs from 'components/Tabs'
import { SIZES } from 'components/PageSize'
import ActivityList, { fetchActivityList } from 'components/NFTActivityList'
import CopyBtn from 'components/CopyBtn'
import Metadata from 'components/Metadata'
import { client, handleNftImageLoadError, getIpfsUrl } from 'utils'
import styles from './styles.module.scss'

const collectionInfoQuery = gql`
  query ($address: HashAddress, $token_id: String) {
    erc721_udts(input: { contract_address: $address, limit: 1 }) {
      entries {
        name
        symbol
        icon
        holders_count
        minted_count
      }
    }

    holders: erc721_inventory(input: { contract_address: $address, token_id: $token_id }) {
      entries {
        address_hash
        token_instance {
          metadata
        }
      }
    }
  }
`

type TokenMetadata = Record<'name' | 'description' | 'image', string>

interface CollectionInfo {
  name: string | null
  symbol: string | null
  icon: string | null
  holder_count: number
  minted_count: number
  owner: string | null
  metadata?: TokenMetadata
}

interface NftCollectionProps {
  erc721_udts: {
    entries: Array<CollectionInfo>
  }
  holders: {
    entries: Array<{
      address_hash: string
      token_instance?: { metadata: TokenMetadata }
    }>
  }
}

interface Variables {
  address: string
  token_id: string
}

const fetchNftCollection = (variables: Variables): Promise<CollectionInfo | undefined> =>
  client
    .request<NftCollectionProps>(collectionInfoQuery, variables)
    .then(data => ({
      ...data.erc721_udts.entries[0],
      owner: data.holders.entries[0]?.address_hash ?? null,
      metadata: data.holders.entries[0]?.token_instance?.metadata,
    }))
    .catch(() => undefined)

const tabs = ['activity', 'metadata']

const NftItem = () => {
  const [t] = useTranslation('nft')
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

  const { isLoading: isInfoLoading, data: info } = useQuery(
    ['nft-collection-info', address, id],
    () => fetchNftCollection({ address, token_id: token_id as string }),
    {
      enabled: !!address && !!token_id,
      refetchInterval: 10000,
    },
  )

  const { isLoading: isNftActivityListLoading, data: nftActivityList } = useQuery(
    ['nft-collection-activity', address, token_id, before, after, page_size],
    () => fetchActivityList(listParams),
    {
      enabled: address && token_id && tab === tabs[0],
    },
  )

  const infoList: Array<{
    field: string
    content: React.ReactNode | string
  }> = [
    {
      field: t('owner'),
      content: info?.owner ? (
        <div className={styles.owner}>
          <HashLink label={info.owner as string} href={`/account/${info.owner}`} />
          <CopyBtn content={info.owner as string} field={t('address', { ns: 'common' })} />
        </div>
      ) : isInfoLoading ? (
        <Skeleton animation="wave" />
      ) : (
        '-'
      ),
    },
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
      content: t('erc-721'),
    },
  ]

  const metadata = info?.metadata
  const title = `${t('nft-collection')} ${info?.name ?? '-'}`

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
                {info?.metadata?.name || '-'}
                {info?.name ? (
                  <NextLink href={`/multi-token-collection/${address}`}>
                    <a className={styles.collection}>{`${info.name}` + (info.symbol ? `(${info.symbol})` : '')}</a>
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
            tabs={tabs.slice(0, metadata ? 2 : -1).map((tabItem, idx) => ({
              label: t(tabItem),
              href: `/nft-item/${address}/${token_id}?tab=${tabs[idx]}`,
            }))}
          />
          {tab === tabs[0] ? (
            !isNftActivityListLoading && nftActivityList ? (
              <ActivityList transfers={nftActivityList} token_id={token_id} />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === tabs[1] && metadata ? <Metadata {...metadata} /> : null}
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
  const lng = await serverSideTranslations(locale, ['common', 'nft', 'list'])
  return { props: lng }
}

export default NftItem
