import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
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
} from '@mui/material'
import PageTitle from 'components/PageTitle'
import SubpageHead from 'components/SubpageHead'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/Pagination'
import PageSize, { SIZES } from 'components/PageSize'
import {
  fetchContractList,
  getContractListRes,
  handleApiError,
  PageNonPositiveException,
  PageSizeException,
} from 'utils'

type ParsedContractList = ReturnType<typeof getContractListRes>
type State = { contracts: ParsedContractList['contracts']; page: number; totalPage: number; pageSize: number }

const ContractList = (initState: State) => {
  const [{ contracts, pageSize, page, totalPage }, setContractList] = useState(initState)
  const [t] = useTranslation(['list', 'common'])

  useEffect(() => {
    setContractList(initState)
  }, [initState])

  const title = t('contract_list_title')

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
                    <TableCell component="th">{t(`balance`)}</TableCell>
                    <TableCell component="th">{t(`tx_count`)}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {totalPage ? (
                    contracts.map(c => (
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
                          {c.balance}
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
              <PageSize pageSize={pageSize} />
              <Pagination total={totalPage * pageSize} page={page} pageSize={pageSize} />
            </Stack>
          </Box>
        </Paper>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ locale, res, query }) => {
  const { page, page_size = SIZES[1] } = query

  try {
    if (+page < 1) {
      throw new PageNonPositiveException()
    }

    if (!SIZES.includes(page_size as string)) {
      throw new PageSizeException()
    }

    const [{ contracts, meta }, lng] = await Promise.all([
      fetchContractList({ page: page as string, page_size: page_size as string }),
      serverSideTranslations(locale, ['common', 'list']),
    ])

    return { props: { ...lng, ...meta, contracts } }
  } catch (err) {
    switch (true) {
      case err instanceof PageNonPositiveException:
      case err instanceof PageSizeException: {
        return {
          redirect: {
            destination: `/${locale}/blocks`,
            permanent: false,
          },
        }
      }
      default: {
        return handleApiError(err, res, locale)
      }
    }
  }
}

export default ContractList
