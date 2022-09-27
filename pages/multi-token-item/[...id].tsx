import type { GetStaticPaths, GetStaticProps } from 'next'
import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Skeleton } from '@mui/material'
import SubpageHead from 'components/SubpageHead'
import HashLink from 'components/HashLink'
import Tabs from 'components/Tabs'
import { SIZES } from 'components/PageSize'
import ActivityList, { fetchActivityList } from 'components/MultiTokenActivityList'
import CopyBtn from 'components/CopyBtn'
import { client, handleNftImageLoadError } from 'utils'
import styles from './styles.module.scss'
// TODO: add metadata display after PR https://github.com/Magickbase/godwoken-explorer-ui/pull/542 is merged, that PR introduces ABI of ERC 1155

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

    holders: erc721_erc1155_inventory(input: { contract_address: $address, token_id: $token_id }) {
      entries {
        address_hash
      }
    }
  }
`

interface CollectionInfo {
  name: string | null
  symbol: string | null
  icon: string | null
  holder_count: number
  minted_count: number
  owner: string | null
}

interface InfoProps {
  erc1155_udts: {
    entries: Array<CollectionInfo>
  }
  holders: {
    entries: Array<{ address_hash: string }>
  }
}

interface Variables {
  address: string
  token_id: string
}

const fetchInfo = (variables: Variables): Promise<CollectionInfo | undefined> =>
  client
    .request<InfoProps>(infoQuery, variables)
    .then(data => ({
      ...data.erc1155_udts.entries[0],
      owner: data.holders.entries[0]?.address_hash ?? null,
    }))
    .catch(() => undefined)

const tabs = ['activity']

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

  const { isLoading: isInfoLoading, data: info } = useQuery(
    ['multi-token-item-info', address, id],
    () => fetchInfo({ address, token_id: token_id as string }),
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
      content: t('erc-1155'),
    },
  ]

  const title = `${t('multi-token-collection')} ${info?.name ?? '-'}`

  return (
    <>
      <SubpageHead subtitle={title} />
      <div className={styles.container}>
        <div className={styles.overview}>
          <img src={'/images/nft-placeholder.svg'} onError={handleNftImageLoadError} alt="nft-cover" />
          <div className={styles.info}>
            {isInfoLoading ? <Skeleton animation="wave" /> : <h2>{info?.name || '-'}</h2>}
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
            tabs={tabs.map((tabItem, idx) => ({
              label: t(tabItem),
              href: `/multi-token-item/${id}?tab=${tabs[idx]}`,
            }))}
          />
          {tab === tabs[0] ? (
            !isActivityListLoading && activityList ? (
              <ActivityList transfers={activityList} token_id={token_id} />
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

export default MultiTokenItem
