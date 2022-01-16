import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Container, Paper, Typography, Link } from '@mui/material'
import PageTitle from 'components/PageTitle'
import TxListComp from 'components/TxList'
import { fetchTxList, API, useWS, getTxListRes, handleApiError, PAGE_SIZE, CHANNEL } from 'utils'

type State = { query: Record<string, string>; txList: ParsedTxList }

const TxList = (initState: State) => {
  const [
    {
      query: { account_id: id },
      txList,
    },
    setTxList,
  ] = useState(initState)
  const [txT] = useTranslation('tx')

  useEffect(() => {
    setTxList(initState)
  }, [initState])

  useWS(
    `${CHANNEL.ACCOUNT_TX_LIST}${id}`,
    (init: RawTxList) => {
      setTxList(prev => (prev.txList.page === '1' ? { ...prev, txList: getTxListRes(init) } : prev))
    },
    (update: RawTxList) => {
      setTxList(prev => {
        const totalCount = `${+prev.txList.totalCount + +update.total_count}`
        const txs =
          prev.txList.page === '1'
            ? [...getTxListRes(update).txs, ...prev.txList.txs].slice(0, PAGE_SIZE)
            : prev.txList.txs
        return {
          ...prev,
          txList: {
            ...prev.txList,
            totalCount,
            txs,
          },
        }
      })
    },
    [setTxList, id],
  )

  return (
    <Container sx={{ px: 1, py: 2 }}>
      <PageTitle>
        <Typography variant="inherit" display="inline" pr={1}>
          {txT('txListTitle')}
        </Typography>
        <NextLink href={`/account/${id}`}>
          <Link href={`/account/${id}`} underline="none" color="secondary">
            {id}
          </Link>
        </NextLink>
      </PageTitle>
      <Paper>
        <TxListComp list={txList} />
      </Paper>
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ locale, res, query }) => {
  try {
    const txList = await fetchTxList(query)
    const lng = await serverSideTranslations(locale, ['common', 'tx', 'list'])
    return { props: { query: query as Record<string, string>, txList, ...lng } }
  } catch (err) {
    return handleApiError(err, res, locale)
  }
}

export default TxList
