import type { GetStaticPaths, GetStaticProps } from 'next'
import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Skeleton } from '@mui/material'
import SubpageHead from 'components/SubpageHead'
import PageTitle from 'components/PageTitle'
import InfoList from 'components/InfoList'
import HashLink from 'components/HashLink'
import Tabs from 'components/Tabs'
import NftActivityList, { fetchNftActivityList } from 'components/NftActivityList'
import TokenLogo from 'components/TokenLogo'
import { client, GraphQLSchema } from 'utils'
import styles from './styles.module.scss'
import { SIZES } from 'components/PageSize'

type NftCollectionInfoProps = Omit<GraphQLSchema.NftCollectionListItem, 'id' | 'account'> | undefined

interface NftCollectionProps {
  erc721_udts: {
    entries: [NftCollectionInfoProps]
  }
}

interface Variables {
  address: string
}

const nftCollectionInfoQuery = gql`
  query ($address: HashAddress) {
    erc721_udts(input: { contract_address: $address }) {
      entries {
        name
        symbol
        icon
        holders_count
        minted_count
      }
    }
  }
`
const fetchNftCollection = (variables: Variables): Promise<NftCollectionInfoProps> =>
  client
    .request<NftCollectionProps>(nftCollectionInfoQuery, variables)
    .then(data => data.erc721_udts.entries[0])
    .catch(error => {
      console.error(error)
      return undefined
    })

const tabs = ['activity', 'holders', 'inventory']

const NftCollection = () => {
  const [t] = useTranslation('nft')
  const {
    query: { address, tab = tabs[0], before = null, after = null, page_size = SIZES[1] },
  } = useRouter()

  const { isLoading: isCollectionInfoLoading, data: collectionInfo } = useQuery(
    ['nft-collection', address],
    () =>
      fetchNftCollection({
        address: address as string,
      }),
    {
      enabled: !!address,
      refetchInterval: 10000,
    },
  )
  const listParams = {
    address: address as string,
    before: before as string,
    after: after as string,
    limit: Number.isNaN(+page_size) ? +SIZES[1] : +page_size,
  }

  const { isLoading: isNftActivityListLoading, data: nftActivityList } = useQuery(
    ['nft-collection-activity', address, before, after, page_size],
    () => fetchNftActivityList(listParams),
    {
      enabled: address && tab === tabs[0],
    },
  )

  const infoList: Array<{
    field: string
    content: React.ReactNode | string
  }> = [
    {
      field: t('type'),
      content: t('erc-721'),
    },
    {
      field: t('contract'),
      content: <HashLink label={address as string} href={`/account/${address}`} />,
    },
  ]

  const stats: Array<{ field: string; content: React.ReactNode }> = [
    {
      field: t('holder_count'),
      content: isCollectionInfoLoading ? (
        <Skeleton animation="wave" />
      ) : (
        collectionInfo?.holders_count.toLocaleString('en') ?? '-'
      ),
    },
    {
      field: t('minted_count'),
      content: isCollectionInfoLoading ? (
        <Skeleton animation="wave" />
      ) : (
        collectionInfo?.minted_count.toLocaleString('en') ?? '-'
      ),
    },
  ]

  const title = t(`nft-collection`)
  return (
    <>
      <SubpageHead subtitle={`${title} ${collectionInfo?.name || address}`} />
      <div className={styles.container}>
        <PageTitle>
          <div className={styles.title}>
            <TokenLogo name={collectionInfo?.name} logo={collectionInfo?.icon} />
            <span>{collectionInfo?.name}</span>
          </div>
        </PageTitle>
        <div className={styles.overview}>
          <InfoList title={t(`info`)} list={infoList} />
          <InfoList title={t(`stats`)} list={stats} />
        </div>

        <div className={styles.list} data-tab={tab}>
          <Tabs
            value={tabs.indexOf(tab as string)}
            tabs={tabs.map((tabItem, idx) => ({
              label: t(tabItem),
              href: `/nft-collection/${address}?tab=${tabs[idx]}`,
            }))}
          />
          {tab === tabs[0] ? (
            isNftActivityListLoading || !nftActivityList ? (
              <Skeleton animation="wave" />
            ) : (
              <NftActivityList erc721_token_transfers={nftActivityList} />
            )
          ) : null}
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

export default NftCollection
