import type { GetStaticProps } from 'next'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Container, Typography, Box, TableContainer, Stack, Skeleton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { gql } from 'graphql-request'
import PageTitle from 'components/PageTitle'
import SubpageHead from 'components/SubpageHead'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/SimplePagination'
import Table from 'components/Table'
import Amount from 'components/Amount'
import SortIcon from 'assets/icons/sort.svg'
import { SIZES } from 'components/PageSize'
import { PCKB_UDT_INFO, client, GraphQLSchema } from 'utils'
import styles from './index.module.scss'

interface Variables {
  before: string | null
  after: string | null
  limit: number
  tx_count_sort: string
  balance_sort: string
}

type ContractListProps = {
  smart_contracts: {
    entries: Array<{
      name: string
      id: string
      ckb_balance: string
      compiler_file_format: string
      compiler_version: string
      deployment_tx_hash: string
      other_info: string | null
      account: {
        eth_address: string
        transaction_count: number
      }
    }>
    metadata: GraphQLSchema.PageMetadata
  }
}

const contractListQuery = gql`
  query ($before: String, $after: String, $limit: Int, $tx_count_sort: SortType, $balance_sort: SortType) {
    smart_contracts(
      input: {
        before: $before
        after: $after
        limit: $limit
        sorter: [
          { sort_type: $tx_count_sort, sort_value: EX_TX_COUNT }
          { sort_type: $balance_sort, sort_value: CKB_BALANCE }
        ]
      }
    ) {
      entries {
        name
        id
        ckb_balance
        compiler_file_format
        compiler_version
        deployment_tx_hash
        other_info
        account {
          eth_address
          transaction_count
        }
      }
      metadata {
        total_count
        after
        before
      }
    }
  }
`

const fetchList = (variables: Variables): Promise<ContractListProps['smart_contracts']> =>
  client
    .request<ContractListProps>(contractListQuery, variables)
    .then(data => data.smart_contracts)
    .catch((): ContractListProps['smart_contracts'] => ({
      entries: [],
      metadata: {
        total_count: 0,
        before: null,
        after: null,
      },
    }))

const ContractList = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [t] = useTranslation(['list', 'common'])
  const title = t('contract_list_title')

  const {
    push,
    asPath,
    query: {
      before = null,
      after = null,
      page_size = SIZES[1],
      tx_count_sort = 'DESC',
      balance_sort = 'DESC',
      ...restQuery
    },
  } = useRouter()

  const { isLoading, data } = useQuery(
    ['contract-list', before, after, page_size, tx_count_sort, balance_sort],
    () =>
      fetchList({
        tx_count_sort: tx_count_sort as string,
        balance_sort: balance_sort as string,
        before: before as string,
        after: after as string,
        limit: Number.isNaN(+page_size) ? +SIZES[1] : +page_size,
      }),
    {
      refetchInterval: 10000,
    },
  )

  const handleTXCountSortClick = (e: React.MouseEvent<HTMLOrSVGElement>) => {
    const {
      dataset: { order },
    } = e.currentTarget
    push(
      `${asPath.split('?')[0] ?? ''}?${new URLSearchParams({
        ...restQuery,
        ...defaultSortValue,
        page_size: page_size as string,
        tx_count_sort: order === 'ASC' ? 'DESC' : 'ASC',
      })}`,
    )
  }
  const defaultSortValue = {
    balance_sort: 'DESC',
    tx_count_sort: 'DESC',
  }

  const handleBalanceSortClick = (e: React.MouseEvent<HTMLOrSVGElement>) => {
    const {
      dataset: { order },
    } = e.currentTarget
    push(
      `${asPath.split('?')[0] ?? ''}?${new URLSearchParams({
        ...restQuery,
        ...defaultSortValue,
        page_size: page_size as string,
        balance_sort: order === 'ASC' ? 'DESC' : 'ASC',
      })}`,
    )
  }

  return (
    <>
      <SubpageHead subtitle={title} />
      <Container sx={{ px: { xs: 2, lg: 0 }, pb: { xs: 5.5, md: 11 } }}>
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
            pt: { xs: 2, md: 3 },
            pb: 2,
            mt: { xs: 2, md: 3 },
            bgcolor: '#fff',
          }}
        >
          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="space-between"
            alignItems="center"
            mb={{ xs: 1.5, md: 3 }}
            px={{ xs: 1.5, md: 3 }}
          >
            {!isLoading ? (
              <Typography variant="inherit" color="secondary" fontWeight={500} fontSize={{ xs: 14, md: 16 }}>
                {t(`n_kinds_in_total`, {
                  number: data?.metadata.total_count ?? '-',
                })}
              </Typography>
            ) : (
              <Skeleton animation="wave" width={50} height={24} />
            )}
          </Stack>

          <TableContainer>
            <Table>
              <thead style={{ textTransform: 'capitalize', fontSize: isMobile ? 12 : 14 }}>
                <tr>
                  <th>{t(`address`)}</th>
                  <th>{t(`contract_name`)}</th>
                  <th>{t(`compiler`)}</th>
                  <th>{t(`compiler_version`)}</th>
                  <th>
                    {t(`balance`)}
                    <span style={{ textTransform: 'none' }}>{`(${PCKB_UDT_INFO.symbol})`}</span>
                    <SortIcon onClick={handleBalanceSortClick} data-order={balance_sort} className={styles.sorter} />
                  </th>
                  <th style={{ textAlign: 'end' }}>
                    {t(`tx_count`)}
                    <SortIcon onClick={handleTXCountSortClick} data-order={tx_count_sort} className={styles.sorter} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: +page_size }).map((_, idx) => (
                    <tr key={idx}>
                      <td colSpan={6}>
                        <Skeleton animation="wave" />
                      </td>
                    </tr>
                  ))
                ) : data.metadata.total_count ? (
                  data.entries.map(c => (
                    <tr key={c.id} title={c.account.eth_address}>
                      <td style={{ width: '25%' }}>
                        <Address
                          address={c.account.eth_address}
                          leading={isMobile ? 8 : 30}
                          sx={{ width: 'min-content' }}
                        />
                      </td>
                      <td title={c.name}>{c.name}</td>
                      <td style={{ textTransform: 'capitalize' }} title={c?.compiler_file_format}>
                        {c?.compiler_file_format?.split(' ')[0] ?? '-'}
                      </td>
                      <td title={c.compiler_version}>{c.compiler_version?.split('+')[0]}</td>
                      <td title={c.ckb_balance}>
                        <Amount amount={c.ckb_balance ?? '0'} udt={{ symbol: PCKB_UDT_INFO.symbol, decimal: 10 }} />
                      </td>
                      <td style={{ textAlign: 'end' }} title={`${c.account.transaction_count}`}>
                        {/* {c.account.transaction_count.toLocaleString('en')} */}
                        {c.account.transaction_count}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} align="center">
                      {t(`no_records`)}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common', 'list'])
  return { props: lng }
}

export default ContractList
