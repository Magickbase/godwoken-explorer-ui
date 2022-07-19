import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import {
  Container,
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
  tableCellClasses,
} from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import PageTitle from 'components/PageTitle'
import SubpageHead from 'components/SubpageHead'
import Pagination from 'components/Pagination'
import PageSize, { SIZES } from 'components/PageSize'
import BlockStateIcon from 'components/BlockStateIcon'
import {
  fetchBlockList,
  getBlockListRes,
  handleApiError,
  PageNonPositiveException,
  PageSizeException,
  timeDistance,
  validatePageQuery,
} from 'utils'

type ParsedBlockList = ReturnType<typeof getBlockListRes>
type State = { blockList: ParsedBlockList; pageSize: number }

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.root}`]: {
    color: theme.palette.secondary.main,
    fontWeight: 400,
    width: '20%',
    padding: 8,
    borderColor: '#f0f0f0',
    [theme.breakpoints.down('sm')]: {
      minWidth: 120,
    },
  },
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#fafafa',
    color: theme.palette.secondary.light,
    whiteSpace: 'nowrap',
    height: 48,
    fontSize: 14,
    [theme.breakpoints.down('sm')]: {
      fontSize: 12,
      height: 32,
    },
  },
  [`&.${tableCellClasses.body}`]: {
    height: 64,
    [theme.breakpoints.down('sm')]: {
      height: 52.5,
    },
  },
}))

const BlockList = (initState: State) => {
  const [{ blockList, pageSize }, setBlockList] = useState(initState)
  const [t, { language }] = useTranslation(['list', 'common'])
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.up('sm'))

  useEffect(() => {
    setBlockList(initState)
  }, [initState])

  const title = t('block_list_title')

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
              justifyContent="sapce-between"
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
              <Pagination total={blockList.totalPage * pageSize} page={blockList.page} pageSize={pageSize} />
            </Stack>
          ) : null}

          <TableContainer>
            <Table>
              <TableHead sx={{ textTransform: 'capitalize' }}>
                <TableRow sx={{ borderTop: '1px solid #f0f0f0' }}>
                  <StyledTableCell component="th" sx={{ pl: { xs: '12px !important', md: '24px !important' } }}>
                    {t(`block_number`)}
                  </StyledTableCell>
                  <StyledTableCell component="th">{t(`age`)}</StyledTableCell>
                  <StyledTableCell component="th" sx={{ minWidth: { md: 260 } }}>
                    {t(`tx_count`)}
                  </StyledTableCell>
                  <StyledTableCell component="th">{t(`gas_used`)}</StyledTableCell>
                  <StyledTableCell
                    component="th"
                    sx={{ textAlign: 'end', pr: { xs: '12px !important', md: '24px !important' } }}
                  >
                    {t(`gas_limit`)}
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {blockList.totalPage ? (
                  blockList.blocks.map(b => (
                    <TableRow key={b.hash}>
                      <StyledTableCell sx={{ pl: { xs: '12px !important', md: '24px !important' } }}>
                        <Stack direction="row" alignItems="center">
                          <NextLink href={`block/${b.hash}`} passHref>
                            <Link href={`block/${b.hash}`} underline="none" color="primary">
                              {b.number.toLocaleString('en')}
                            </Link>
                          </NextLink>
                          <BlockStateIcon state={b.finalizeState} />
                        </Stack>
                      </StyledTableCell>
                      <StyledTableCell sx={{ whiteSpace: 'nowrap' }}>
                        {b.timestamp > 0 ? (
                          <time dateTime={new Date(b.timestamp).toISOString()}>
                            {timeDistance(b.timestamp, language)}
                          </time>
                        ) : (
                          t('pending')
                        )}
                      </StyledTableCell>
                      <StyledTableCell>{b.txCount.toLocaleString('en')}</StyledTableCell>
                      <StyledTableCell>{(+b.gas.used).toLocaleString('en')}</StyledTableCell>
                      <StyledTableCell sx={{ textAlign: 'end', pr: { xs: '12px !important', md: '24px !important' } }}>
                        {(+b.gas.limit).toLocaleString('en')}
                      </StyledTableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <StyledTableCell colSpan={5} align="center">
                      {t(`no_records`)}
                    </StyledTableCell>
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
            <PageSize pageSize={pageSize} />
            <Typography color="secondary.light" fontSize={{ xs: 12, md: 14 }}>
              {t('showLatestRecords', { ns: 'common', number: matches ? '500k' : '100k' })}
            </Typography>
            <Pagination total={blockList.totalPage * pageSize} page={blockList.page} pageSize={pageSize} />
          </Stack>
        </Box>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ locale, res, query }) => {
  const { page, page_size = SIZES[1] } = query

  try {
    validatePageQuery(page as string, { size: page_size as string, sizes: SIZES })

    const [blockList, lng] = await Promise.all([
      fetchBlockList({ page: page as string, page_size: page_size as string }),
      serverSideTranslations(locale, ['common', 'list']),
    ])

    return { props: { ...lng, blockList, pageSize: +page_size } }
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

export default BlockList
