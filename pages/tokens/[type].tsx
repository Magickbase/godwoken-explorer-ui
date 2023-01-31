import type { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { gql } from 'graphql-request'
import { useQuery } from 'react-query'
import { Container, Stack, Link, Typography, Skeleton, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import SubpageHead from 'components/SubpageHead'
import Pagination from 'components/SimplePagination'
import Table from 'components/Table'
import PageTitle from 'components/PageTitle'
import HashLink from 'components/HashLink'
import TokenLogo from 'components/TokenLogo'
import FilterMenu from 'components/FilterMenu'
import Amount from 'components/Amount'
import Tooltip from 'components/Tooltip'
import Address from 'components/TruncatedAddress'
import { SIZES } from 'components/PageSize'
import SortIcon from 'assets/icons/sort.svg'
import AddIcon from 'assets/icons/add.svg'
import NoDataIcon from 'assets/icons/no-data.svg'
import EmptyFilteredListIcon from 'assets/icons/empty-filtered-list.svg'
import { GraphQLSchema, client, parseTokenName } from 'utils'
import styles from './styles.module.scss'

const BRIDGED_TOKEN_TEMPLATE_URL =
  'https://github.com/magickbase/godwoken_explorer/issues/new?assignees=Keith-CY&labels=Token+Registration&template=register-a-new-bridged-token.yml&title=%5BBridged+Token%5D+%2A%2AToken+Name%2A%2A'
const NATIVE_TOKEN_TEMPLATE_URL =
  'https://github.com/magickbase/godwoken_explorer/issues/new?assignees=Keith-CY&labels=Token+Registration&template=register-a-new-native-erc20-token.yml&title=%5BNative+ERC20+Token%5D+%2A%2AToken+Name%2A%2A'

type TokenListProps = {
  udts: {
    entries: Array<{
      id: string
      bridge_account_id: number
      contract_address_hash: string | null
      name: string
      type: GraphQLSchema.UdtType
      supply: string
      decimal: number
      icon: string | null
      symbol: string
      holders_count: number
      account: Pick<GraphQLSchema.Account, 'eth_address' | 'script_hash' | 'bit_alias'>
    }>
    metadata: GraphQLSchema.PageMetadata
  }
}
interface Variables {
  before: string | null
  after: string | null
  name: string | null
  type: string
  limit: number
  holder_count_sort: string
  name_sort: string
  supply_sort: string
}
enum SortTypesEnum {
  holder_count_sort = 'holder_count_sort',
  name_sort = 'name_sort',
  supply_sort = 'supply_sort',
}

const tokenListQuery = gql`
  query (
    $name: String
    $type: UdtType
    $before: String
    $after: String
    $limit: Int
    $holder_count_sort: SortType
    $name_sort: SortType
    $supply_sort: SortType
  ) {
    udts(
      input: {
        type: $type
        before: $before
        after: $after
        limit: $limit
        fuzzy_name: $name
        sorter: [
          { sort_type: $holder_count_sort, sort_value: EX_HOLDERS_COUNT }
          { sort_type: $name_sort, sort_value: NAME }
          { sort_type: $supply_sort, sort_value: SUPPLY }
        ]
      }
    ) {
      entries {
        id
        bridge_account_id
        name
        decimal
        icon
        symbol
        type
        supply
        holders_count
        contract_address_hash
        account {
          eth_address
          script_hash
          bit_alias
        }
      }
      metadata {
        total_count
        before
        after
      }
    }
  }
`

const fetchTokenList = (variables: Variables): Promise<TokenListProps['udts']> =>
  client
    .request<TokenListProps>(tokenListQuery, variables)
    .then(data => data.udts)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

const FILTER_KEYS = ['name']
const TokenList = () => {
  const [t] = useTranslation(['tokens', 'common', 'list'])
  const {
    push,
    asPath,
    query: {
      type,
      before = null,
      after = null,
      name = null,
      page_size = SIZES[1],
      holder_count_sort = 'DESC',
      name_sort = 'DESC',
      supply_sort = 'DESC',
      ...query
    },
  } = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const headers = [
    { key: 'token' },
    { key: 'address', label: 'address' },
    { key: type === 'bridge' ? 'circulatingSupply' : 'totalSupply' },
    { key: 'holderCount' },
    { key: 'origin' },
    { key: 'bridge' },
  ]

  const { isLoading, data } = useQuery(
    ['tokens', type, before, after, name, page_size, holder_count_sort, name_sort, supply_sort],
    () =>
      fetchTokenList({
        type: type.toString().toUpperCase(),
        before: before as string,
        after: after as string,
        name: name ? `${name}%` : null,
        limit: Number.isNaN(+page_size) ? +SIZES[1] : +page_size,
        holder_count_sort: holder_count_sort as string,
        name_sort: name_sort as string,
        supply_sort: supply_sort as string,
      }),
    {
      refetchInterval: 10000,
    },
  )

  const handleSorterClick = (e: React.MouseEvent<HTMLOrSVGElement>, type) => {
    const {
      dataset: { order },
    } = e.currentTarget
    push(
      `${asPath.split('?')[0] ?? ''}?${new URLSearchParams({
        ...query,
        name: name ? (name as string) : '',
        page_size: page_size as string,
        holder_count_sort: holder_count_sort as string,
        name_sort: name_sort as string,
        supply_sort: supply_sort as string,
        [type]: order === 'ASC' ? 'DESC' : 'ASC',
      })}`,
    )
  }

  const isFiltered = !!name
  const isFilterUnnecessary = !data?.metadata.total_count && !isFiltered
  const title = t(`${type}-udt-list`)

  return (
    <>
      <SubpageHead subtitle={title} />
      <Container
        sx={{ px: { xs: 2, lg: 0 }, pb: { xs: 5.5, md: 11 } }}
        className={styles.container}
        data-is-filter-unnecessary={isFilterUnnecessary}
      >
        <PageTitle>
          <Typography variant="inherit" display="inline" pr={1}>
            {title}
          </Typography>
        </PageTitle>
        <Box
          sx={{
            borderRadius: {
              xs: 2,
              sm: 4,
            },
            border: {
              xs: '0.5px solid #F0F0F0',
              md: '1px solid #F0F0F0',
            },
            pt: { xs: 1.5, md: 2 },
            mt: { xs: 2, md: 3 },
            bgcolor: '#fff',
          }}
        >
          {!isLoading ? (
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="space-between"
              alignItems="center"
              mb={{ xs: 1.5, md: 2 }}
              px={{ xs: 1.5, md: 3 }}
            >
              <Typography variant="inherit" color="secondary" fontWeight={500} fontSize={{ xs: 14, md: 16 }}>
                {t('n_kinds_in_total', {
                  ns: 'list',
                  number: data?.metadata.total_count ?? '-',
                })}
              </Typography>
              <a
                className={styles.add}
                href={type === 'bridge' ? BRIDGED_TOKEN_TEMPLATE_URL : NATIVE_TOKEN_TEMPLATE_URL}
              >
                {t(type === 'bridge' ? 'add-bridged-token' : 'add-native-erc20-token')}
                <AddIcon />
              </a>
            </Stack>
          ) : (
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="space-between"
              alignItems="center"
              mb={{ xs: 1.5, md: 2 }}
              px={{ xs: 1.5, md: 3 }}
            >
              <Skeleton animation="wave" width={50} />
              <Skeleton animation="wave" width={50} />
            </Stack>
          )}

          <Table>
            <thead style={{ textTransform: 'capitalize', fontSize: isMobile ? 12 : 14 }}>
              <tr style={{ borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
                {headers.map(h => (
                  <th key={h.key} title={t(h.label ?? h.key)}>
                    <div>
                      <div>{t(h.label ?? h.key)}</div>
                      {h.key === 'token' ? (
                        <>
                          <div className={styles.sortIcon}>
                            <SortIcon
                              onClick={e => handleSorterClick(e, SortTypesEnum.name_sort)}
                              data-order={name_sort}
                              className={styles.sorter}
                            />
                          </div>
                          <span>
                            <FilterMenu filterKeys={[FILTER_KEYS[0]]} />
                          </span>
                        </>
                      ) : null}
                      {h.key === 'holderCount' ? (
                        <SortIcon
                          onClick={e => handleSorterClick(e, SortTypesEnum.holder_count_sort)}
                          data-order={holder_count_sort}
                          className={styles.sorter}
                        />
                      ) : null}
                      {h.key === 'circulatingSupply' || h.key === 'totalSupply' ? (
                        <SortIcon
                          onClick={e => handleSorterClick(e, SortTypesEnum.supply_sort)}
                          data-order={supply_sort}
                          className={styles.sorter}
                        />
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: +page_size }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={headers.length}>
                      <Skeleton animation="wave" />
                    </td>
                  </tr>
                ))
              ) : data && data.metadata.total_count ? (
                data.entries.map(token => {
                  let { name, bridge, origin } = parseTokenName(token.name)
                  if (!name) {
                    name = token.name
                  }
                  const id = token.bridge_account_id ?? token.id
                  const addr = token.contract_address_hash || token.account.script_hash
                  const domain = token.account?.bit_alias

                  const shortTruncatedAddr = `${addr.slice(0, 8)}...${addr.slice(-8)}`
                  const longTruncatedAddr = `${addr.slice(0, 12)}...${addr.slice(-12)}`

                  return (
                    <tr key={id}>
                      <td title={name}>
                        <Stack direction="row" alignItems="center">
                          <div className={styles.logo}>
                            <TokenLogo logo={token.icon} name={token.name} />
                          </div>
                          {type === 'bridge' ? (
                            <Tooltip title={t(`view-mapped-native-token`)} placement="top">
                              <span>
                                <NextLink href={`/token/${id}`} passHref>
                                  <Link
                                    href={`/token/${id}`}
                                    display="flex"
                                    alignItems="center"
                                    underline="none"
                                    color="primary"
                                    ml={1}
                                  >
                                    <Typography
                                      fontSize="inherit"
                                      fontFamily="inherit"
                                      sx={{
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        maxWidth: '16ch',
                                      }}
                                    >
                                      {name || '-'}
                                    </Typography>
                                  </Link>
                                </NextLink>
                              </span>
                            </Tooltip>
                          ) : (
                            <NextLink href={`/token/${id}`} passHref>
                              <Link
                                href={`/token/${id}`}
                                display="flex"
                                alignItems="center"
                                underline="none"
                                color="primary"
                                ml={1}
                              >
                                <Typography
                                  fontSize="inherit"
                                  fontFamily="inherit"
                                  sx={{
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    maxWidth: '16ch',
                                  }}
                                >
                                  {name || '-'}
                                </Typography>
                              </Link>
                            </NextLink>
                          )}
                        </Stack>
                      </td>
                      <td title={addr}>
                        {domain ? (
                          <Address address={addr} domain={domain} />
                        ) : addr.length > 42 ? (
                          <Tooltip title={addr} placement="top">
                            <span>
                              <HashLink
                                label={isMobile ? shortTruncatedAddr : longTruncatedAddr}
                                href={`/account/${addr}`}
                              />
                            </span>
                          </Tooltip>
                        ) : (
                          <HashLink label={isMobile ? shortTruncatedAddr : addr} href={`/account/${addr}`} />
                        )}
                      </td>
                      <td>
                        <div
                          style={{
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            width: 180,
                          }}
                        >
                          <Amount amount={token.supply ?? '0'} udt={token} showSymbol />
                        </div>
                      </td>
                      <td style={{ minWidth: isMobile ? 100 : 125 }} title={`${token.holders_count || '0'}`}>
                        {token.holders_count || '0'}
                      </td>
                      <td title={origin}>{origin || '-'}</td>
                      <td title={bridge}>{bridge || '-'}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={headers.length}>
                    {isFiltered ? (
                      <div className={styles.noRecords}>
                        <EmptyFilteredListIcon />
                        <span>{t(`no_related_content`, { ns: 'list' })}</span>
                      </div>
                    ) : (
                      <div className={styles.noRecords}>
                        <NoDataIcon />
                        <span>{t(`no_records`)}</span>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {data?.metadata.total_count ? (
            <div style={{ overflow: 'hidden' }}>
              {!data ? (
                <Skeleton animation="wave" width="calc(100% - 48px)" sx={{ mx: '24px', my: '20px' }} />
              ) : (
                <Pagination {...data.metadata} />
              )}
            </div>
          ) : null}
        </Box>
      </Container>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [{ params: { type: 'native' } }, { params: { type: 'bridge' } }],
  fallback: true,
})

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common', 'tokens', 'list'])
  return { props: lng }
}

export default TokenList
