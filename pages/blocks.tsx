import type { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useQuery } from 'react-query'
import {
  Container,
  Typography,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  Link,
  Stack,
  Skeleton,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import PageTitle from 'components/PageTitle'
import SubpageHead from 'components/SubpageHead'
import Pagination from 'components/Pagination'
import PageSize, { SIZES } from 'components/PageSize'
import BlockStateIcon from 'components/BlockStateIcon'
import TableCell from 'components/TableCell'
import { fetchBlockList, timeDistance } from 'utils'

const BlockList = () => {
  const [t, { language }] = useTranslation(['list', 'common'])
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.up('sm'))
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
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="space-between"
              alignItems="center"
              mt={{ xs: 2, md: 2 }}
              px={{ xs: 1.5, md: 3 }}
            >
              <Skeleton animation="wave" width={50} height={24} />
              <Skeleton animation="wave" width={50} height={24} />
            </Stack>
          </Box>
        </Container>
      </>
    )
  }

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
          {blockList.blocks.length >= 2 ? (
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="space-between"
              alignItems="center"
              mb={{ xs: 1.5, md: 3 }}
              px={{ xs: 1.5, md: 3 }}
            >
              <Typography
                variant="inherit"
                color="secondary"
                flex="1 0 300px"
                fontWeight={500}
                fontSize={{ xs: 14, md: 16 }}
              >
                {t(`block_from_to`, {
                  to: blockList.blocks[0].number,
                  from: blockList.blocks[blockList.blocks.length - 1].number,
                })}
              </Typography>
              <Pagination total={blockList.totalPage * +page_size} page={blockList.page} pageSize={+page_size} />
            </Stack>
          ) : null}

          <TableContainer>
            <Table>
              <TableHead sx={{ textTransform: 'capitalize' }}>
                <TableRow sx={{ borderTop: '1px solid #f0f0f0' }}>
                  <TableCell component="th" sx={{ pl: { xs: '12px !important', md: '24px !important' } }}>
                    {t(`block_number`)}
                  </TableCell>
                  <TableCell component="th">{t(`age`)}</TableCell>
                  <TableCell component="th" sx={{ minWidth: { md: 260 } }}>
                    {t(`tx_count`)}
                  </TableCell>
                  <TableCell component="th">{t(`gas_used`)}</TableCell>
                  <TableCell
                    component="th"
                    sx={{ textAlign: 'end', pr: { xs: '12px !important', md: '24px !important' } }}
                  >
                    {t(`gas_limit`)}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {blockList.totalPage ? (
                  blockList.blocks.map(b => (
                    <TableRow key={b.hash}>
                      <TableCell sx={{ pl: { xs: '12px !important', md: '24px !important' } }}>
                        <Stack direction="row" alignItems="center" columnGap={{ xs: 0.4, md: 1 }}>
                          <NextLink href={`block/${b.hash}`} passHref>
                            <Link href={`block/${b.hash}`} underline="none" color="primary">
                              {b.number.toLocaleString('en')}
                            </Link>
                          </NextLink>
                          <BlockStateIcon state={b.finalizeState} />
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {b.timestamp > 0 ? (
                          <time dateTime={new Date(b.timestamp).toISOString()}>
                            {timeDistance(b.timestamp, language)}
                          </time>
                        ) : (
                          t('pending')
                        )}
                      </TableCell>
                      <TableCell>{b.txCount.toLocaleString('en')}</TableCell>
                      <TableCell>{(+b.gas.used).toLocaleString('en')}</TableCell>
                      <TableCell sx={{ textAlign: 'end', pr: { xs: '12px !important', md: '24px !important' } }}>
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

          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="space-between"
            alignItems="center"
            mt={{ xs: 2, md: 2 }}
            px={{ xs: 1.5, md: 3 }}
          >
            <PageSize pageSize={+page_size} />
            <Typography color="secondary.light" fontSize={{ xs: 12, md: 14 }}>
              {t('showLatestRecords', { ns: 'common', number: matches ? '500k' : '100k' })}
            </Typography>
            <Pagination total={blockList.totalPage * +page_size} page={blockList.page} pageSize={+page_size} />
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

export default BlockList
