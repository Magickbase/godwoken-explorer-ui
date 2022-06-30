import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useQuery } from 'react-query'
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
import Pagination from 'components/Pagination'
import PageSize, { SIZES } from 'components/PageSize'
import BlockStateIcon from 'components/BlockStateIcon'
import { fetchBlockList, timeDistance } from 'utils'

const BlockList = () => {
  const [t, { language }] = useTranslation(['list', 'common'])
  const {
    query: { page = '1', page_size = SIZES[1] },
  } = useRouter()

  const { isLoading, data: blockList } = useQuery(['blocks', page, page_size], () =>
    fetchBlockList({ page: page as string, page_size: page_size as string }),
  )

  const title = t('block_list_title')

  if (isLoading || !blockList) {
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
                <Table size="small" sx={{ fontSize: { xs: 12, md: 14 } }}>
                  <TableHead sx={{ textTransform: 'capitalize' }}>
                    <TableRow>
                      <TableCell component="th">{t(`block_number`)}</TableCell>
                      <TableCell component="th">{t(`age`)}</TableCell>
                      <TableCell component="th">{t(`tx_count`)}</TableCell>
                      <TableCell component="th" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {t(`gas_used`)}
                      </TableCell>
                      <TableCell component="th" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {t(`gas_limit`)}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.from({ length: +page_size }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell colSpan={5}>
                          <Skeleton animation="wave" height={20} />
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
            {blockList.blocks.length >= 2 ? (
              <Stack direction="row" justifyContent="sapce-between" alignItems="center">
                <Typography variant="inherit" flex="1">
                  {t(`block_from_to`, {
                    to: blockList.blocks[0].number,
                    from: blockList.blocks[blockList.blocks.length - 1].number,
                  })}
                </Typography>
                <Pagination total={blockList.totalPage * +page_size} page={blockList.page} pageSize={+page_size} />
              </Stack>
            ) : null}
            <TableContainer>
              <Table size="small" sx={{ fontSize: { xs: 12, md: 14 } }}>
                <TableHead sx={{ textTransform: 'capitalize' }}>
                  <TableRow>
                    <TableCell component="th">{t(`block_number`)}</TableCell>
                    <TableCell component="th">{t(`age`)}</TableCell>
                    <TableCell component="th">{t(`tx_count`)}</TableCell>
                    <TableCell component="th" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {t(`gas_used`)}
                    </TableCell>
                    <TableCell component="th" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {t(`gas_limit`)}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {blockList.totalPage ? (
                    blockList.blocks.map(b => (
                      <TableRow key={b.hash}>
                        <TableCell sx={{ fontSize: 'inherit' }}>
                          <Stack direction="row" alignItems="center">
                            <BlockStateIcon state={b.finalizeState} />
                            <NextLink href={`block/${b.hash}`}>
                              <Link href={`block/${b.hash}`} underline="none" color="secondary">
                                {b.number.toLocaleString('en')}
                              </Link>
                            </NextLink>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 'inherit' }}>
                          {b.timestamp > 0 ? (
                            <time dateTime={new Date(b.timestamp).toISOString()}>
                              {timeDistance(b.timestamp, language)}
                            </time>
                          ) : (
                            t('pending')
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: 'inherit' }}>{b.txCount.toLocaleString('en')}</TableCell>
                        <TableCell sx={{ fontSize: 'inherit', display: { xs: 'none', sm: 'table-cell' } }}>
                          {(+b.gas.used).toLocaleString('en')}
                        </TableCell>
                        <TableCell sx={{ fontSize: 'inherit', display: { xs: 'none', sm: 'table-cell' } }}>
                          {(+b.gas.limit).toLocaleString('en')}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {t(`no_records`)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <PageSize pageSize={+page_size} />
              <Pagination total={blockList.totalPage * +page_size} page={blockList.page} pageSize={+page_size} />
            </Stack>
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

export default BlockList
