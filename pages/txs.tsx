import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Container, Paper, Typography, Box, Stack } from '@mui/material'
import PageTitle from 'components/PageTitle'
import TxListComp from 'components/TxList'
import SubpageHead from 'components/SubpageHead'
import Pagination from 'components/Pagination'
import { SIZES } from 'components/PageSize'
import {
  fetchTxList,
  getTxListRes,
  handleApiError,
  validatePageQuery,
  PageNonPositiveException,
  PageSizeException,
} from 'utils'

// type RawTxList = Parameters<typeof getTxListRes>[0]
type ParsedTxList = ReturnType<typeof getTxListRes>
type State = { txList: ParsedTxList; pageSize: number }

const TxList = (initState: State) => {
  const [{ txList, pageSize }, setList] = useState(initState)
  const [t] = useTranslation('list')

  useEffect(() => {
    setList(initState)
  }, [initState])

  const title = t('tx_list_title')

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
            {txList.txs.length >= 2 ? (
              <Stack direction="row" justifyContent="sapce-between" alignItems="center">
                <Typography variant="inherit" flex="1">
                  {t(`tx_in_block_from_to`, {
                    to: txList.txs[0].blockNumber,
                    from: txList.txs[txList.txs.length - 1].blockNumber,
                  })}
                </Typography>
                <Pagination total={+txList.totalCount} page={+txList.page} pageSize={pageSize} />
              </Stack>
            ) : null}
            <TxListComp list={txList} pageSize={pageSize} showPageSizeSelector />
          </Box>
        </Paper>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ locale, res, query }) => {
  const { page, page_size = SIZES[1] } = query

  try {
    validatePageQuery(page as string, { size: page_size as string, sizes: SIZES })
    const [txList, lng] = await Promise.all([
      fetchTxList({ page: query.page as string, page_size: page_size as string }),
      serverSideTranslations(locale, ['common', 'list']),
    ])
    return { props: { ...lng, txList, pageSize: +page_size } }
  } catch (err) {
    switch (true) {
      case err instanceof PageNonPositiveException:
      case err instanceof PageSizeException: {
        return {
          redirect: {
            destination: `/${locale}/txs`,
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

export default TxList
