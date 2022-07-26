import type { GetStaticProps } from 'next'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import BigNumber from 'bignumber.js'
import {
  Container,
  Typography,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  Stack,
  Skeleton,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import PageTitle from 'components/PageTitle'
import SubpageHead from 'components/SubpageHead'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/Pagination'
import PageSize, { SIZES } from 'components/PageSize'
import TableCell from 'components/TableCell'
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
              <Typography
                variant="inherit"
                color="secondary"
                flex="1 0 300px"
                fontWeight={500}
                fontSize={{ xs: 14, md: 16 }}
              >
                {t(`n_contracts_in_total`, {
                  number: data.contracts.length,
                })}
              </Typography>
            ) : (
              <Skeleton animation="wave" width={50} height={24} />
            )}
          </Stack>

          <TableContainer>
            <Table size="small" sx={{ fontSize: { xs: 12, md: 14 } }}>
              <TableHead sx={{ textTransform: 'capitalize' }}>
                <TableRow sx={{ borderTop: '1px solid #f0f0f0' }}>
                  <TableCell component="th" sx={{ pl: { xs: '12px !important', md: '24px !important' } }}>
                    {t(`address`)}
                  </TableCell>
                  <TableCell component="th" sx={{ whiteSpace: 'nowrap' }}>
                    {t(`contract_name`)}
                  </TableCell>
                  <TableCell component="th">{t(`compiler`)}</TableCell>
                  <TableCell component="th">{t(`compiler_version`)}</TableCell>
                  <TableCell component="th">
                    {t(`balance`)}
                    <span style={{ textTransform: 'none' }}>{`(${PCKB_SYMBOL})`}</span>
                  </TableCell>
                  <TableCell
                    component="th"
                    sx={{ textAlign: 'end', pr: { xs: '12px !important', md: '24px !important' } }}
                  >
                    {t(`tx_count`)}
                  </TableCell>
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
                      <TableCell sx={{ pl: { xs: '12px !important', md: '24px !important' } }}>
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
          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent={isMobile ? 'center' : 'end'}
            alignItems="center"
            mt={{ xs: 2, md: 2 }}
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
