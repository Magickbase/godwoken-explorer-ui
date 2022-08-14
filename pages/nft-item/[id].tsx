import type { GetStaticPaths, GetStaticProps } from 'next'
import Image from 'next/image'
import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Skeleton } from '@mui/material'
import HashLink from 'components/HashLink'
import InfoList from 'components/InfoList'
import Tabs from 'components/Tabs'
import { client } from 'utils'
import styles from './styles.module.scss'
import { SIZES } from 'components/PageSize'
import PlaceholderIcon from 'assets/icons/nft-placeholder.svg'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import CopyBtn from 'components/CopyBtn'
import TruncatedAddress from 'components/TruncatedAddress'

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

const tabs = ['activity']

const NftCollection = () => {
  const [t] = useTranslation('nft')
  const {
    query: { id, before = null, after = null, limit = SIZES[1], tab = tabs[0] },
  } = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const mockNftInfo = {
    name: 'NFT name',
    tokenURI:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAJUlEQVR42u3NQQEAAAQEsJNcdFLw2gqsMukcK4lEIpFIJBLJS7KG6yVo40DbTgAAAABJRU5ErkJggg==',
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
      field: t('owner'),
      content: (
        <div style={{ display: 'flex' }}>
          <TruncatedAddress address={id as string} leading={8} />
          <CopyBtn content={id as string} />
        </div>
      ),
    },
    {
      field: t('contract'),
      content: (
        <div>
          <HashLink label={id as string} href={`/account/${id}`} />
          <CopyBtn content={id as string} />
        </div>
      ),
    },
    {
      field: t('tokenID'),
      content: (
        <div>
          <HashLink
            label={id as string}
            href={`/nft-item/${id}`}
            monoFont={false}
            style={{ color: theme.palette.secondary.main }}
          />
          <CopyBtn content={id as string} />
        </div>
      ),
    },
    {
      field: t('type'),
      content: 'erc-721',
    },
  ]

  return (
    <>
      <div className={styles.container}>
        <div className={styles.overview}>
          <div className={styles.imgContainer}>
            {!mockNftInfo.tokenURI ? (
              <Image src={mockNftInfo.tokenURI} alt="nft-item-image" width={440} height={440} />
            ) : (
              <div className={styles.imgPlaceholder}>
                <PlaceholderIcon />
              </div>
            )}
          </div>
          {!isMobile ? (
            <div className={styles.infoContainer}>
              <h2>{mockNftInfo.name}</h2>
              {infoList.map(({ field, content }, i) => (
                <div key={i} className={styles.item}>
                  <div className={styles.field}>{field}</div>
                  <div className={styles.content}>{content}</div>
                </div>
              ))}
            </div>
          ) : (
            <InfoList title={mockNftInfo.name} list={infoList} />
          )}
        </div>

        <div className={styles.list}>
          <Tabs
            value={tabs.indexOf(tab as string)}
            tabs={tabs.map((tabItem, idx) => ({
              label: t(tabItem),
              href: `/nft-item/${id}?tab=${tabs[idx]}`,
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
