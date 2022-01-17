import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Container, Paper, Typography, Link } from '@mui/material'
import PageTitle from 'components/PageTitle'
import TxListComp from 'components/TxList'
import { fetchTxList, useWS, getTxListRes, handleApiError, PAGE_SIZE, CHANNEL } from 'utils'

type RawTxList = Parameters<typeof getTxListRes>[0]
type ParsedTxList = ReturnType<typeof getTxListRes>
type State = { query: Record<string, string>; txList: ParsedTxList }

const TxList = (initState: State) => {
  const [{ txList }, setTxList] = useState(initState)
  const [txT] = useTranslation('tx')

  useEffect(() => {
    setTxList(initState)
  }, [initState])

  return (
    <Container sx={{ px: 1, py: 2 }}>
      <PageTitle>
        <Typography variant="inherit" display="inline" pr={1}>
          {txT('txListTitle')}
        </Typography>
        {/* <NextLink href={`/account/${id}`}>
          <Link href={`/account/${id}`} underline="none" color="secondary">
            {id}
          </Link>
        </NextLink> */}
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
