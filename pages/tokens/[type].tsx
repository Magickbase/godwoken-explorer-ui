import type { GetStaticProps, GetStaticPaths } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { gql } from 'graphql-request'
import { useQuery } from 'react-query'
import { Container, Stack, Link, Typography, Skeleton, Box, Button } from '@mui/material'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import SubpageHead from 'components/SubpageHead'
import Pagination from 'components/SimplePagination'
import Table from 'components/Table'
import PageTitle from 'components/PageTitle'
import HashLink from 'components/HashLink'
import TokenLogo from 'components/TokenLogo'
import Tooltip from 'components/Tooltip'
import FilterMenu from 'components/FilterMenu'
// import SortIcon from 'assets/icons/sort.svg'
import { SIZES } from 'components/PageSize'
import { formatAmount, GraphQLSchema, client } from 'utils'
import styles from './styles.module.scss'

const BRIDGED_TOKEN_TEMPLATE_URL =
  'https://github.com/magickbase/godwoken_explorer/issues/new?assignees=Keith-CY&labels=Token+Registration&template=register-a-new-bridged-token.yml&title=%5BBridged+Token%5D+%2A%2AToken+Name%2A%2A'
const NATIVE_TOKEN_TEMPLATE_URL =
  'https://github.com/magickbase/godwoken_explorer/issues/new?assignees=Keith-CY&labels=Token+Registration&template=register-a-new-native-erc20-token.yml&title=%5BNative+ERC20+Token%5D+%2A%2AToken+Name%2A%2A'

const parseTokenName = (name: string) => {
  const parsed = name?.split(/\(via|from/) ?? []
  return {
    name: parsed[0]?.trim() ?? '',
    bridge: parsed[1]?.trim() ?? '',
    origin: parsed[2]?.trim().slice(0, -1) ?? '',
  }
}

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
      account: Pick<GraphQLSchema.Account, 'eth_address' | 'script_hash'>
    }>
    metadata: GraphQLSchema.PageMetadata
  }
}

const tokenListQuery = gql`
  query ($name: String, $type: UdtType, $before: String, $after: String, $limit: Int) {
    udts(input: { type: $type, before: $before, after: $after, limit: $limit, fuzzy_name: $name }) {
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

interface Variables {
  before: string | null
  after: string | null
  name: string | null
  type: string
  limit: number
  // holder_count_sort: string
}

const fetchTokenList = (variables: Variables): Promise<TokenListProps['udts']> =>
  client
    .request<TokenListProps>(tokenListQuery, variables)
    .then(data => data.udts)
    .catch(() => ({ entries: [], metadata: { before: null, after: null, total_count: 0 } }))

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
      /* holder_count_sort = 'DESC',*/ ...query
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
    ['tokens', type, before, after, name],
    () =>
      fetchTokenList({
        type: type.toString().toUpperCase(),
        before: before as string,
        after: after as string,
        name: name ? `${name}%` : null,
        limit: Number.isNaN(+page_size) ? +SIZES[1] : +page_size,
        // holder_count_sort: holder_count_sort as string,
      }),
    {
      refetchInterval: 10000,
    },
  )

  const handleHolderCountSortClick = (e: React.MouseEvent<HTMLOrSVGElement>) => {
    const {
      dataset: { order },
    } = e.currentTarget
    push(
      `${asPath.split('?')[0] ?? ''}?${new URLSearchParams({
        ...query,
        name: name ? (name as string) : '',
        page_size: page_size as string,
        holder_count_sort: order === 'ASC' ? 'DESC' : 'ASC',
      })}`,
    )
  }

  const title = t(`${type}-udt-list`)
  return (
    <>
      <SubpageHead subtitle={title} />
      <Container sx={{ px: { xs: 2, sm: 3, md: 2, lg: 0 }, pb: { xs: 5.5, md: 11 } }} className={styles.container}>
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
              <Button
                endIcon={<AddCircleOutlineRoundedIcon sx={{ fontSize: 13 }} />}
                component={Link}
                href={type === 'bridge' ? BRIDGED_TOKEN_TEMPLATE_URL : NATIVE_TOKEN_TEMPLATE_URL}
                target="_blank"
                rel="noreferrer noopener"
                sx={{
                  'bgcolor': theme.palette.primary.light,
                  'borderRadius': 2,
                  'textTransform': 'none',
                  'height': 40,
                  'lineHeight': 40,
                  'px': { xs: 1, md: 2 },
                  'fontWeight': 500,
                  'fontSize': { xs: 13, md: 14 },
                  '& .MuiButton-endIcon': {
                    marginLeft: 0.5,
                  },
                }}
              >
                {t(type === 'bridge' ? 'add-bridged-token' : 'add-native-erc20-token')}
              </Button>
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
                  <th
                    key={h.key}
                    title={t(h.label ?? h.key)}
                    style={{
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t(h.label ?? h.key)}
                    {h.key === 'token' ? (
                      <span>
                        <FilterMenu filterKeys={['name']} />
                      </span>
                    ) : null}
                    {/* {h.key === 'holderCount' ? ( */}
                    {/*   <SortIcon */}
                    {/*     onClick={handleHolderCountSortClick} */}
                    {/*     data-order={holder_count_sort} */}
                    {/*     className={styles.sorter} */}
                    {/*   /> */}
                    {/* ) : null} */}
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
                  const supply = formatAmount(token.supply ?? '0', {
                    symbol: token.symbol?.split('.')[0] ?? '',
                    decimal: token.decimal,
                  })
                  const id = token.bridge_account_id ?? token.id
                  const addr = token.contract_address_hash || token.account.script_hash
                  return (
                    <tr key={id}>
                      <td title={name}>
                        <Stack direction="row" alignItems="center">
                          <TokenLogo logo={token.icon} name={token.name} />
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
                                  width: isMobile ? 90 : 120,
                                }}
                              >
                                {name || '-'}
                              </Typography>
                            </Link>
                          </NextLink>
                        </Stack>
                      </td>
                      <td>
                        {addr.length > 42 ? (
                          <Tooltip title={addr} placement="top">
                            <span>
                              <HashLink label={`${addr.slice(0, 12)}...${addr.slice(-12)}`} href={`/account/${addr}`} />
                            </span>
                          </Tooltip>
                        ) : (
                          <HashLink
                            label={isMobile ? `${addr.slice(0, 8)}...${addr.slice(-8)}` : addr}
                            href={`/account/${addr}`}
                          />
                        )}
                      </td>
                      <td>
                        <div
                          style={{
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            width: type === 'bridge' ? 180 : 220,
                          }}
                        >
                          {supply}
                        </div>
                      </td>
                      <td style={{ minWidth: isMobile ? 100 : 125 }}>{token.holders_count || '0'}</td>
                      <td>{origin || '-'}</td>
                      <td>{bridge || '-'}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={headers.length} className={styles.noRecords}>
                    {t(`no_records`)}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          <div style={{ overflow: 'hidden' }}>
            {!data ? (
              <Skeleton animation="wave" width="calc(100% - 48px)" sx={{ mx: '24px', my: '20px' }} />
            ) : (
              <Pagination {...data.metadata} pageSize={page_size as string} />
            )}
          </div>
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
