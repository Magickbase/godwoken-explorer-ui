import type { GetStaticProps } from 'next'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import BigNumber from 'bignumber.js'
import { Container, Typography, Box, TableContainer, Stack, Skeleton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import PageTitle from 'components/PageTitle'
import SubpageHead from 'components/SubpageHead'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/Pagination'
import { SIZES } from 'components/PageSize'
import Table from 'components/Table'
import { fetchContractList, PCKB_SYMBOL } from 'utils'

const ContractList = () => {
  const [t] = useTranslation(['list', 'common'])
  const {
    query: { page = '1', page_size = SIZES[2] },
  } = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const title = t('contract_list_title')
  const { isLoading, data } = useQuery(
    ['contracts', page, page_size],
    () => fetchContractList({ page: page as string, page_size: page_size as string }),
    { refetchInterval: 10000 },
  )

  return (
    <>
      <SubpageHead subtitle={title} />
      <Container sx={{ px: { xs: 2, sm: 3, md: 2, lg: 0 }, pb: { xs: 5.5, md: 11 } }}>
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
                  number: data.contracts.length,
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
                    <span style={{ textTransform: 'none' }}>{`(${PCKB_SYMBOL})`}</span>
                  </th>
                  <th style={{ textAlign: 'end' }}>{t(`tx_count`)}</th>
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
                ) : data.meta.totalPage ? (
                  data.contracts.map(c => (
                    <tr key={c.id} title={c.address}>
                      <td style={{ width: '25%' }}>
                        <Address address={c.address} leading={isMobile ? 8 : 30} sx={{ width: 'min-content' }} />
                      </td>
                      <td title={c.name}>{c.name}</td>
                      <td style={{ textTransform: 'capitalize' }} title={c.compiler.fileFormat}>
                        {c.compiler.fileFormat?.split(' ')[0]}
                      </td>
                      <td title={c.compiler.version}>{c.compiler.version?.split('+')[0]}</td>
                      <td title={c.balance}>{new BigNumber(c.balance ?? '0').toFormat()}</td>
                      <td style={{ textAlign: 'end' }} title={`${c.txCount}`}>
                        {c.txCount.toLocaleString('en')}
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

          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent={isMobile ? 'center' : 'end'}
            alignItems="center"
            mt={{ xs: 0, md: 2 }}
            px={{ xs: 1.5, md: 3 }}
          >
            {/* <PageSize pageSize={+page_size} /> */}
            {isLoading ? (
              <Skeleton animation="wave" width="20px" />
            ) : (
              <Pagination total={data?.meta.totalPage * +page_size} page={+page} pageSize={+page_size} />
            )}
          </Stack>
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
