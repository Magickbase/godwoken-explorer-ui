import type { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { gql } from 'graphql-request'
import { useQuery } from 'react-query'
import { Skeleton } from '@mui/material'
import SubpageHead from 'components/SubpageHead'
import Pagination from 'components/SimplePagination'
import Table from 'components/Table'
import PageTitle from 'components/PageTitle'
import HashLink from 'components/HashLink'
import TokenLogo from 'components/TokenLogo'
import Tooltip from 'components/Tooltip'
import { SIZES } from 'components/PageSize'
import NoDataIcon from 'assets/icons/no-data.svg'
import { GraphQLSchema, client } from 'utils'
import styles from './styles.module.scss'

type SearchUdtListProps = {
  search_udt: {
    entries: Array<{
      id: string
      contract_address_hash: string | null
      name: string
      symbol: string
      type: GraphQLSchema.UdtType
      icon: string | null
      eth_type: GraphQLSchema.TokenType
    }>
    metadata: GraphQLSchema.PageMetadata
  }
}
interface Variables {
  before: string | null
  after: string | null
  name: string
  limit: number | null
  address: string | null
}
// TODO: add sorter after backend support

const searchUdtListQuery = gql`
  query search_udt($limit: Int, $name: String, $before: String, $after: String, $address: String) {
    search_udt(
      input: { limit: $limit, fuzzy_name: $name, before: $before, after: $after, contract_address: $address }
    ) {
      entries {
        id
        name
        symbol
        icon
        contract_address_hash
        eth_type
        type
      }
      metadata {
        total_count
        after
        before
      }
    }
  }
`

const fetchSearchUdtList = (variables: Variables): Promise<SearchUdtListProps['search_udt']> =>
  client
    .request<SearchUdtListProps>(searchUdtListQuery, variables)
    .then(data => data.search_udt)
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

const SearchUdtResultList = () => {
  const [t] = useTranslation(['nft', 'common', 'list'])
  const {
    query: { before = null, after = null, search = null, address = null, page_size = SIZES[1] },
  } = useRouter()

  const title = t(`search_result_title`, { name: search, ns: 'list' })
  const { isLoading, data: list } = useQuery(
    ['search-udt-list', page_size, before, after, search, address],
    () =>
      fetchSearchUdtList({
        before: before as string,
        after: after as string,
        name: search ? `${search}%` : null,
        limit: Number.isNaN(+page_size) ? +SIZES[1] : +page_size,
        address: address as string,
      }),
    { refetchInterval: 10000 },
  )

  const handleTokenLink = (type: GraphQLSchema.TokenType, tokenId: string, contractAddr?: string) => {
    switch (type) {
      case GraphQLSchema.TokenType.ERC20:
        return `/token/${tokenId}`
      case GraphQLSchema.TokenType.ERC721:
        return `/nft-item/${contractAddr}/${tokenId}`
      case GraphQLSchema.TokenType.ERC1155:
        return `/multi-token-item/${contractAddr}/${tokenId}`
      default:
        return ''
    }
  }

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
                <th className={styles.tokenHeader}>{t('token', { ns: 'list' })}</th>
                <th className={styles.typeHeader}>{t('type', { ns: 'list' })}</th>
                <th>{t('address')} </th>
              </tr>
            </thead>
            <tbody>
              {list?.metadata.total_count ? (
                list.entries.map(item => {
                  const { id, eth_type, contract_address_hash, name, icon, symbol } = item
                  const tokenLink = handleTokenLink(eth_type, id, contract_address_hash)
                  return (
                    <tr key={id}>
                      {tokenLink ? (
                        <td title={name}>
                          <NextLink href={tokenLink}>
                            <a className={styles.token}>
                              <TokenLogo name={name} logo={icon} />
                              <span>
                                {name ?? '-'}
                                {symbol ? `(${symbol})` : ''}
                              </span>
                            </a>
                          </NextLink>
                        </td>
                      ) : (
                        <td title={name}>
                          <span className={styles.token}>
                            <TokenLogo name={name} logo={icon} />
                            <span>
                              {name ?? '-'}
                              {symbol ? `(${symbol})` : ''}
                            </span>
                          </span>
                        </td>
                      )}
                      <td className={styles.type}>{t(eth_type as string, { ns: 'account' })}</td>
                      {contract_address_hash ? (
                        <td className={styles.addr} title={contract_address_hash}>
                          <HashLink label={contract_address_hash} href={`/account/${contract_address_hash}`} />
                          <Tooltip title={contract_address_hash} placement="top">
                            <span>
                              <HashLink
                                label={`${contract_address_hash.slice(0, 8)}...${contract_address_hash.slice(-8)}`}
                                href={`/account/${contract_address_hash}`}
                              />
                            </span>
                          </Tooltip>
                        </td>
                      ) : (
                        <td className={styles.addr}>-</td>
                      )}
                    </tr>
                  )
                })
              ) : isLoading ? (
                Array.from({ length: +page_size }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={3}>
                      <Skeleton animation="wave" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>
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

SearchUdtResultList.displayName = 'SearchUdtResultList'

export default SearchUdtResultList
