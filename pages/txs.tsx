import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Container, Paper, Typography, Box, Stack } from '@mui/material'
import PageTitle from 'components/PageTitle'
import TxListComp, { TxListProps, fetchTxList } from 'components/TxList'
import SubpageHead from 'components/SubpageHead'
import Pagination from 'components/SimplePagination'
import { SIZES } from 'components/PageSize'
import { handleApiError, PageNonPositiveException, PageSizeException } from 'utils'

type State = { txList: TxListProps['transactions']; pageSize: number }

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
            <TxListComp transactions={txList} maxCount="500k" pageSize={pageSize} />
          </Box>
        </Paper>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ locale, res, query }) => {
  const { page_size = SIZES[1], before = null, after = null, block_from = null, block_to = null } = query

  try {
    const pageSize = Number.isNaN(+page_size) ? +SIZES[1] : +page_size
    const [txList, lng] = await Promise.all([
      fetchTxList({
        limit: pageSize as number,
        before: before as string | null,
        after: after as string | null,
        start_block_number: block_from ? +block_from : null,
        end_block_number: block_to ? +block_to : null,
      }),
      serverSideTranslations(locale, ['common', 'list']),
    ])
    return { props: { ...lng, txList, pageSize } }
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
