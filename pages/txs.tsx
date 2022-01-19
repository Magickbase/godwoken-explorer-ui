import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Container, Paper, Typography } from '@mui/material'
import PageTitle from 'components/PageTitle'
import TxListComp from 'components/TxList'
import SubpageHead from 'components/SubpageHead'
import { fetchTxList, getTxListRes, handleApiError } from 'utils'

// type RawTxList = Parameters<typeof getTxListRes>[0]
type ParsedTxList = ReturnType<typeof getTxListRes>
type State = { query: Record<string, string>; txList: ParsedTxList }

const TxList = (initState: State) => {
  const [{ txList }, setTxList] = useState(initState)
  const [txT] = useTranslation('tx')

  useEffect(() => {
    setTxList(initState)
  }, [initState])

  const title = txT('txListTitle')

  return (
    <>
      <SubpageHead subtitle={title} />
      <Container sx={{ px: 1, py: 2 }}>
        <PageTitle>
          <Typography variant="inherit" display="inline" pr={1}>
            {title}
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
    </>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ locale, res, query }) => {
  return {
    notFound: true,
  }
  // try {
  //   const txList = await fetchTxList(query)
  //   const lng = await serverSideTranslations(locale, ['common', 'tx', 'list'])
  //   return { props: { query: query as Record<string, string>, txList, ...lng } }
  // } catch (err) {
  //   return handleApiError(err, res, locale)
  // }
}

export default TxList
