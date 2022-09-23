import type { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { Skeleton } from '@mui/material'
import SubpageHead from 'components/SubpageHead'
import PageTitle from 'components/PageTitle'
import Table from 'components/Table'
import Pagination from 'components/SimplePagination'
import TokenLogo from 'components/TokenLogo'
import HashLink from 'components/HashLink'
import { SIZES } from 'components/PageSize'
import NoDataIcon from 'assets/icons/no-data.svg'
import { client, GraphQLSchema } from 'utils'
import styles from './styles.module.scss'
import FilterMenu from 'components/FilterMenu'

interface NftCollectionListProps {
  erc721_udts: {
    entries: Array<GraphQLSchema.NftCollectionListItem>
    metadata: GraphQLSchema.PageMetadata
  }
}

const erc721ListQuery = gql`
  query ($limit: Int, $name: String, $before: String, $after: String) {
    erc721_udts(input: { limit: $limit, fuzzy_name: $name, before: $before, after: $after }) {
      entries {
        id
        name
        symbol
        icon
        account {
          eth_address
        }
        holders_count
        minted_count
      }
      metadata {
        total_count
        after
        before
      }
    }
  }
`

interface Variables {
  name: string | null
  before: string | null
  after: string | null
  limit: number
}

const fetchErc721List = (variables: Variables): Promise<NftCollectionListProps['erc721_udts']> =>
  client
    .request<NftCollectionListProps>(erc721ListQuery, variables)
    .then(data => data.erc721_udts)
    .catch(error => {
      console.error(error)
      return {
        entries: [],
        metadata: {
          total_count: 0,
          before: null,
          after: null,
        },
      }
    })

const FILTER_KEYS = ['name']
const NftCollectionList = () => {
  const [t] = useTranslation(['nft', 'common', 'list'])
  const {
    query: { before = null, after = null, name = null, page_size = SIZES[1] },
  } = useRouter()

  const title = t(`nft-collections`)
  const { isLoading, data: list } = useQuery(
    ['erc721-list', page_size, before, after, name],
    () =>
      fetchErc721List({
        before: before as string,
        after: after as string,
        name: name ? `${name}%` : null,
        limit: Number.isNaN(!page_size) ? +SIZES[1] : +page_size,
      }),
    { refetchInterval: 10000 },
  )

  return (
    <>
      <SubpageHead subtitle={title} />
      <div className={styles.container}>
        <PageTitle>{title}</PageTitle>
        <div className={styles.list}>
          <div className={styles.subheader}>
            <span>
              {t(`n_kinds_in_total`, {
                ns: 'list',
                number: list?.metadata.total_count.toLocaleString('en') ?? '-',
              })}
            </span>
            {list?.metadata.total_count ? <Pagination {...list.metadata} /> : null}
          </div>
          <Table style={{ overflow: 'unset' }}>
            <thead>
              <tr>
                <th>
                  {t('token')}
                  <span>
                    <FilterMenu filterKeys={[FILTER_KEYS[0]]} />
                  </span>
                </th>
                <th>{t('address')} </th>
                <th>{t('holder_count')} </th>
                <th>{t('minted_count')}</th>
              </tr>
            </thead>
            <tbody>
              {list?.metadata.total_count ? (
                list.entries.map(item => {
                  return (
                    <tr key={item.id}>
                      <td title={item.name}>
                        <NextLink href={`/nft-collection/${item.account.eth_address}`}>
                          <a className={styles.token}>
                            <TokenLogo name={item.name} logo={item.icon} />
                            <span>
                              {item.name ?? '-'}
                              {item.symbol ? `(${item.symbol})` : ''}
                            </span>
                          </a>
                        </NextLink>
                      </td>
                      <td className={styles.addr} title={item.account.eth_address}>
                        <HashLink label={item.account.eth_address} href={`/account/${item.account.eth_address}`} />
                        <span className="tooltip" data-tooltip={item.account.eth_address}>
                          <HashLink
                            label={`${item.account.eth_address.slice(0, 8)}...${item.account.eth_address.slice(-8)}`}
                            href={`/account/${item.account.eth_address}`}
                          />
                        </span>
                      </td>
                      <td title={item.holders_count.toLocaleString('en')}>{item.holders_count.toLocaleString('en')}</td>
                      <td title={item.minted_count.toLocaleString('en')}>{item.minted_count.toLocaleString('en')}</td>
                    </tr>
                  )
                })
              ) : isLoading ? (
                Array.from({ length: +page_size }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={4}>
                      <Skeleton animation="wave" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <div className={styles.noRecords}>
                      <NoDataIcon />
                      <span>{t(`no_records`, { ns: 'list' })}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          {list?.metadata.total_count ? <Pagination {...list.metadata} /> : null}
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common', 'nft', 'list'])
  return { props: lng }
}

NftCollectionList.displayName = 'NftCollectionList'

export default NftCollectionList
