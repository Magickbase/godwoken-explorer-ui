import type { GetStaticProps } from 'next'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import BigNumber from 'bignumber.js'
import {
  Container,
  Paper,
  Typography,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Link,
  Stack,
  Skeleton,
} from '@mui/material'
import PageTitle from 'components/PageTitle'
import SubpageHead from 'components/SubpageHead'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/Pagination'
import PageSize, { SIZES } from 'components/PageSize'
import { fetchContractList, PCKB_SYMBOL } from 'utils'

const ContractList = () => {
  const [t] = useTranslation(['list', 'common'])
  const {
    query: { page = '1', page_size = SIZES[2] },
  } = useRouter()

  const title = t('contract_list_title')
  const { isLoading, data } = useQuery(
    ['contracts', page, page_size],
    () => fetchContractList({ page: page as string, page_size: page_size as string }),
    { refetchInterval: 10000 },
  )

  return (
    <>
      <SubpageHead subtitle={title} />
      <Container sx={{ px: 1, py: 2 }}>
        <PageTitle>
          <Typography variant="inherit" display="inline" pr={1}>
            {title}
          </Typography>
        </PageTitle>
        <Paper>
          <Box sx={{ px: 1, py: 2 }}>
            <TableContainer>
              <Table size="small" sx={{ fontSize: { xs: 12, md: 14 } }}>
                <TableHead sx={{ textTransform: 'capitalize' }}>
                  <TableRow>
                    <TableCell component="th">{t(`address`)}</TableCell>
                    <TableCell component="th" sx={{ whiteSpace: 'nowrap' }}>
                      {t(`contract_name`)}
                    </TableCell>
                    <TableCell component="th">{t(`compiler`)}</TableCell>
                    <TableCell component="th">{t(`compiler_version`)}</TableCell>
                    <TableCell component="th">
                      {t(`balance`)}
                      <span style={{ textTransform: 'none' }}>{`(${PCKB_SYMBOL})`}</span>
                    </TableCell>
                    <TableCell component="th">{t(`tx_count`)}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: +page_size }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell colSpan={6}>
                          <Skeleton animation="wave" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : data.meta.totalPage ? (
                    data.contracts.map(c => (
                      <TableRow key={c.id} title={c.address}>
                        <TableCell sx={{ fontSize: 'inherit', display: { xs: 'none', md: 'table-cell' } }}>
                          <Stack direction="row" alignItems="center">
                            <NextLink href={`account/${c.address}`}>
                              <Link
                                href={`account/${c.address}`}
                                underline="none"
                                color="secondary"
                                className="mono-font"
                              >
                                {c.address}
                              </Link>
                            </NextLink>
                          </Stack>
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: 'inherit', display: { xs: 'table-cell', md: 'none' } }}
                          title={c.address}
                        >
                          <Address address={c.address} />
                        </TableCell>
                        <TableCell sx={{ fontSize: 'inherit' }} title={c.name}>
                          {c.name}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: 'inherit', textTransform: 'capitalize' }}
                          title={c.compiler.fileFormat}
                        >
                          {c.compiler.fileFormat.split(' ')[0]}
                        </TableCell>
                        <TableCell sx={{ fontSize: 'inherit' }} title={c.compiler.version}>
                          {c.compiler.version.split('+')[0]}
                        </TableCell>
                        <TableCell sx={{ fontSize: 'inherit' }} title={c.balance}>
                          {new BigNumber(c.balance ?? '0').toFormat()}
                        </TableCell>
                        <TableCell sx={{ fontSize: 'inherit' }} title={`${c.txCount}`}>
                          {c.txCount.toLocaleString('en')}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        {t(`no_records`)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <PageSize pageSize={+page_size} />
              {isLoading ? (
                <Skeleton animation="wave" width="20px" />
              ) : (
                <Pagination total={data?.meta.totalPage * +page_size} page={+page} pageSize={+page_size} />
              )}
            </Stack>
          </Box>
        </Paper>
      </Container>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common', 'list'])
  return { props: lng }
}

export default ContractList
