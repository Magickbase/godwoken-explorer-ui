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
import { client } from 'utils'
import styles from './styles.module.scss'

const nftCollectionQuery = gql`
  query ($address: String!, $before: String, $after: String) {
    nft_collection(input: { address: $address, before: $before, after: $after }) {
      holder_count
      minted_count
      contract {
        eth_address
      }
    }
  }
`

interface NftCollectionProps {
  holder_count: number
  minted_count: number
}

interface Variables {
  address: string
}

const fetchNftCollection = (variables: Variables) => client.request<NftCollectionProps>(nftCollectionQuery, variables)

const tabs = ['activity', 'holders', 'inventory']

const NftCollection = () => {
  const [t] = useTranslation('nft')
  const {
    query: { address, tab = tabs[0] },
  } = useRouter()

  const mockNftInfo = {
    name: 'NFT name',
  }

  // TODO: wait for API
  // const { isLoading, data } = useQuery(['nft-collection', address], () =>
  //   fetchNftCollection({
  //     address: address as string,
  //   }),
  // )

  const infoList: Array<{
    field: string
    content: React.ReactNode | string
  }> = [
    {
      field: t('type'),
      content: 'erc-721',
    },
    {
      field: t('contract'),
      content: <HashLink label={address as string} href={`/account/${address}`} />,
    },
  ]

  const stats: Array<{ field: string; content: React.ReactNode }> = [
    { field: t('holder_count'), content: 100 },
    { field: t('minted_count'), content: 2000 },
  ]

  const title = t(`nft-collection`)
  return (
    <>
      <SubpageHead subtitle={`${title} ${mockNftInfo.name}`} />
      <div className={styles.container}>
        <PageTitle>
          <div className={styles.title}>
            <TokenLogo name={mockNftInfo.name} logo="" />
            <span>{mockNftInfo.name}</span>
          </div>
        </PageTitle>
        <div className={styles.overview}>
          <InfoList title={t(`info`)} list={infoList} />
          <InfoList title={t(`stats`)} list={stats} />
        </div>

        <div className={styles.list}>
          <Tabs
            value={tabs.indexOf(tab as string)}
            tabs={tabs.map((tabItem, idx) => ({
              label: t(tabItem),
              href: `/nft-collection/${address}?tab=${tabs[idx]}`,
            }))}
          />
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
  const lng = await serverSideTranslations(locale, ['common', 'nft'])
  return { props: lng }
}

export default NftCollection
