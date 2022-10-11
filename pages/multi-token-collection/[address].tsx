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
import TokenLogo from 'components/TokenLogo'
import { SIZES } from 'components/PageSize'
import ActivityList, { fetchActivityList } from 'components/MultiTokenActivityList'
import HolderList, { fetchHoldersList } from 'components/MultiTokenHolderList'
import InventoryList, { fetchInventoryListOfCollection } from 'components/MultiTokenInventoryList'
import { client, GraphQLSchema } from 'utils'
import styles from './styles.module.scss'

type CollectionInfoProps = Omit<GraphQLSchema.NftCollectionListItem, 'id' | 'account'> | undefined

interface InfoProps {
  erc1155_udts: {
    entries: [CollectionInfoProps]
  }
}

interface Variables {
  address: string
}

const infoQuery = gql`
  query ($address: HashAddress) {
    erc1155_udts(input: { contract_address: $address }) {
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
const fetchInfo = (variables: Variables): Promise<CollectionInfoProps> =>
  client
    .request<InfoProps>(infoQuery, variables)
    .then(data => data.erc1155_udts.entries[0])
    .catch(error => {
      console.error(error)
      return undefined
    })

const tabs = ['activity', 'holders', 'inventory']

const MultiTokenCollection = () => {
  const [t] = useTranslation('multi-token')
  const {
    query: { address, tab = tabs[0], before = null, after = null, page_size = SIZES[1] },
  } = useRouter()

  const { isLoading: isInfoLoading, data: info } = useQuery(
    ['multi-token-info', address],
    () =>
      fetchInfo({
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

  const { isLoading: isActivityListLoading, data: activityList } = useQuery(
    ['multi-token-collection-activity', address, before, after, page_size],
    () => fetchActivityList(listParams),
    {
      enabled: address && tab === tabs[0],
    },
  )

  const { isLoading: isHoldersListLoading, data: holdersList } = useQuery(
    ['multi-token-holders-list', address, before, after, page_size],
    () => fetchHoldersList(listParams),
    { enabled: address && tab === tabs[1] },
  )

  const { isLoading: isInventoryListLoading, data: inventoryList } = useQuery(
    ['multi-token-inventory-list', address, before, after, page_size],
    () => fetchInventoryListOfCollection(listParams),
    { enabled: tab === tabs[2] },
  )

  const infoList: Array<{
    field: string
    content: React.ReactNode | string
  }> = [
    {
      field: t('type'),
      content: t('erc-1155'),
    },
    {
      field: t('contract'),
      content: <HashLink label={address as string} href={`/account/${address}`} />,
    },
  ]

  const stats: Array<{ field: string; content: React.ReactNode }> = [
    {
      field: t('holder_count'),
      content: isInfoLoading ? <Skeleton animation="wave" /> : (+info?.holders_count ?? 0).toLocaleString('en'),
    },
    {
      field: t('minted_count'),
      content: isInfoLoading ? <Skeleton animation="wave" /> : (+info?.minted_count ?? 0).toLocaleString('en'),
    },
  ]

  const title = t(`multi-token-collection`)
  return (
    <>
      <SubpageHead subtitle={`${title} ${info?.name || address}`} />
      <div className={styles.container}>
        <PageTitle>
          <div className={styles.title}>
            <TokenLogo name={info?.name} logo={info?.icon} />
            <span>{info?.name ?? '-'}</span>
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
              href: `/multi-token-collection/${address}?tab=${tabs[idx]}`,
            }))}
          />
          {tab === tabs[0] ? (
            !isActivityListLoading && activityList ? (
              <ActivityList transfers={activityList} />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === tabs[1] ? (
            !isHoldersListLoading && holdersList ? (
              <HolderList holders={holdersList} />
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

export default MultiTokenCollection
