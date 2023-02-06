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
import FilterMenu from 'components/FilterMenu'
import Address from 'components/TruncatedAddress'
import { SIZES } from 'components/PageSize'

import NoDataIcon from 'assets/icons/no-data.svg'
import SortIcon from 'assets/icons/sort.svg'
import { client, GraphQLSchema, handleSorterArrayAfterClick, handleSorterArrayFromUrl } from 'utils'

import styles from './styles.module.scss'

interface MultiTokenCollectionListProps {
  erc1155_udts: {
    entries: Array<GraphQLSchema.MultiTokenCollectionListItem>
    metadata: GraphQLSchema.PageMetadata
  }
}

interface Variables {
  name: string | null
  before: string | null
  after: string | null
  limit: number
  sorter: UdtsSorterInput[] | []
}

type UdtsSorterInput = {
  sort_type: 'ASC' | 'DESC'
  sort_value: 'EX_HOLDERS_COUNT' | 'ID' | 'NAME' | 'SUPPLY' | 'TOKEN_TYPE_COUNT'
}

enum SortTypesEnum {
  holder_count_sort = 'holder_count_sort',
  name_sort = 'name_sort',
  type_count_sort = 'type_count_sort',
}

enum UdtsSorterValueEnum {
  holder_count_sort = 'EX_HOLDERS_COUNT',
  name_sort = 'NAME',
  type_count_sort = 'TOKEN_TYPE_COUNT',
}

const erc1155ListQuery = gql`
  query ($limit: Int, $name: String, $before: String, $after: String, $sorter: UdtsSorterInput) {
    erc1155_udts(input: { limit: $limit, fuzzy_name: $name, before: $before, after: $after, sorter: $sorter }) {
      entries {
        id
        name
        symbol
        icon
        account {
          eth_address
          bit_alias
        }
        holders_count
        minted_count
        token_type_count
      }
      metadata {
        total_count
        after
        before
      }
    }
  }
`

const fetchErc1155List = (variables: Variables): Promise<MultiTokenCollectionListProps['erc1155_udts']> =>
  client
    .request<MultiTokenCollectionListProps>(erc1155ListQuery, variables)
    .then(data => data.erc1155_udts)
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

const MultiTokenCollectionList = () => {
  const [t] = useTranslation(['multi-token', 'common', 'list'])
  const {
    push,
    asPath,
    query: {
      before = null,
      after = null,
      name = null,
      page_size = SIZES[1],
      holder_count_sort,
      name_sort,
      type_count_sort,
      ...restQuery
    },
  } = useRouter()

  const title = t(`multi-token-collections`)

  const handleSorterValues = (url, sorters) => {
    const paramArr = url.slice(url.indexOf('?') + 1).split('&')
    const sorterParams = []

    paramArr.map(param => {
      const [key, val] = param.split('=')
      const decodeVal = decodeURIComponent(val)

      sorters.includes(key) && sorterParams.push({ sort_type: decodeVal, sort_value: UdtsSorterValueEnum[key] })
    })
    return sorterParams
  }

  const sorters = ['holder_count_sort', 'name_sort', 'type_count_sort']
  const pathSorterArray = handleSorterArrayFromUrl(asPath, sorters)
  const sorterArray = handleSorterValues(asPath, sorters)

  const { isLoading, data: list } = useQuery(
    ['erc1155-list', page_size, before, after, name, holder_count_sort, name_sort, type_count_sort],
    () =>
      fetchErc1155List({
        before: before as string,
        after: after as string,
        name: name ? `${name}%` : null,
        limit: Number.isNaN(!page_size) ? +SIZES[1] : +page_size,
        sorter: sorterArray || [],
      }),
    { refetchInterval: 10000 },
  )

  const handleSorterClick = (e: React.MouseEvent<HTMLOrSVGElement>, type) => {
    const {
      dataset: { order },
    } = e.currentTarget
    push(
      `${asPath.split('?')[0] ?? ''}?${new URLSearchParams({
        ...restQuery,
        name: name ? (name as string) : '',
        page_size: page_size as string,
        ...handleSorterArrayAfterClick(pathSorterArray, { type, order: order === 'DESC' ? 'ASC' : 'DESC' }),
      })}`,
    )
  }
  const headers = ['token', 'address', 'type_count', 'holder_count']

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
          <Table>
            <thead>
              <tr>
                {headers.map(item => (
                  <th key={item}>
                    <span className={styles['header-name']}>{t(item)}</span>
                    {item === 'token' ? (
                      <>
                        <span className={styles['token-sorter']}>
                          <SortIcon
                            onClick={e => handleSorterClick(e, SortTypesEnum.name_sort)}
                            data-order={name_sort}
                            className={styles.sorter}
                          />
                        </span>
                        <FilterMenu filterKeys={[FILTER_KEYS[0]]} />
                      </>
                    ) : null}
                    {item === 'type_count' ? (
                      <SortIcon
                        onClick={e => handleSorterClick(e, SortTypesEnum.type_count_sort)}
                        data-order={type_count_sort}
                        className={styles.sorter}
                      />
                    ) : null}
                    {item === 'holder_count' ? (
                      <SortIcon
                        onClick={e => handleSorterClick(e, SortTypesEnum.holder_count_sort)}
                        data-order={holder_count_sort}
                        className={styles.sorter}
                      />
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list?.metadata.total_count ? (
                list.entries.map(item => {
                  const domain = item?.account?.bit_alias

                  return (
                    <tr key={item.id}>
                      <td title={item.name}>
                        <NextLink href={`/multi-token-collection/${item.account.eth_address}`}>
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
                        {domain ? (
                          <div className={styles['address-with-domain']}>
                            <Address address={item.account.eth_address} domain={domain} />
                          </div>
                        ) : (
                          <>
                            <HashLink label={item.account.eth_address} href={`/account/${item.account.eth_address}`} />
                            <span className="tooltip" data-tooltip={item.account.eth_address}>
                              <HashLink
                                label={`${item.account.eth_address.slice(0, 8)}...${item.account.eth_address.slice(
                                  -8,
                                )}`}
                                href={`/account/${item.account.eth_address}`}
                              />
                            </span>
                          </>
                        )}
                      </td>
                      <td title={item.token_type_count.toLocaleString('en')}>
                        {item.token_type_count.toLocaleString('en')}
                      </td>
                      <td title={(+item.holders_count).toLocaleString('en')}>
                        {(+item.holders_count).toLocaleString('en')}
                      </td>
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
  const lng = await serverSideTranslations(locale, ['common', 'multi-token', 'list'])
  return { props: lng }
}

MultiTokenCollectionList.displayName = 'MultiTokenCollectionList'

export default MultiTokenCollectionList
