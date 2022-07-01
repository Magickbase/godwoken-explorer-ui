import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useQuery } from 'react-query'
import {
  Container,
  Paper,
  Typography,
  Box,
  Stack,
  TableContainer,
  TableRow,
  Table,
  TableCell,
  TableHead,
  TableBody,
  Skeleton,
} from '@mui/material'
import PageTitle from 'components/PageTitle'
import TxListComp, { fetchTxList } from 'components/TxList'
import SubpageHead from 'components/SubpageHead'
import Pagination from 'components/SimplePagination'
import { SIZES } from 'components/PageSize'

const TxList = () => {
  const [t] = useTranslation('list')
  const {
    query: { page_size = SIZES[1], before = null, after = null, block_from = null, block_to = null },
  } = useRouter()

  const { isLoading, data: txList } = useQuery(['transactions', before, after, block_from, block_to], () =>
    fetchTxList({
      limit: +page_size as number,
      before: before as string | null,
      after: after as string | null,
      start_block_number: block_from ? +block_from : null,
      end_block_number: block_to ? +block_to : null,
    }),
  )

  const title = t('tx_list_title')
  if (isLoading || !txList) {
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
              <Stack direction="row" justifyContent="space-between" alignItems="center" py={1}>
                <Skeleton animation="wave" width={50} height={24} />
                <Skeleton animation="wave" width={50} height={24} />
              </Stack>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ textTransform: 'capitalize' }}>
                    <TableRow>
                      <TableCell component="th">{t('txHash')}</TableCell>
                      <TableCell component="th">
                        <Stack direction="row" alignItems="center" whiteSpace="nowrap">
                          {t('block')}
                        </Stack>
                      </TableCell>
                      <TableCell component="th">{t('age')} </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }} component="th">
                        {t('from')}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }} component="th">
                        {t('to')}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'table-cell', md: 'none' } }} component="th">
                        {t('transfer')}
                      </TableCell>
                      <TableCell component="th" sx={{ whiteSpace: 'nowrap', textTransform: 'none' }}>{`${t(
                        'value',
                      )} (pCKB)`}</TableCell>
                      <TableCell component="th">{t('type')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.from({ length: +page_size }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell colSpan={8}>
                          <Skeleton animation="wave" height={25} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Stack direction="row" justifyContent="space-between" alignItems="center" py={1}>
                <Skeleton animation="wave" width={50} height={24} />
                <Skeleton animation="wave" width={50} height={24} />
              </Stack>
            </Box>
          </Paper>
        </Container>
      </>
    )
  }

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
            {txList.entries.length >= 2 ? (
              <Stack direction="row" justifyContent="sapce-between" alignItems="center">
                <Typography variant="inherit" flex="1">
                  {t(`tx_in_block_from_to`, {
                    to: txList.entries[0].block.number,
                    from: txList.entries[txList.entries.length - 1].block.number,
                  })}
                </Typography>
                <Pagination {...txList.metadata} />
              </Stack>
            ) : null}
            <TxListComp transactions={txList} maxCount="500k" pageSize={+page_size} />
          </Box>
        </Paper>
      </Container>
    </>
  )
}

export const getStaticProps: GetServerSideProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common', 'list'])
  return { props: lng }
}

export default TxList
