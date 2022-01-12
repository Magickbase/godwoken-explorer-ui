import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import {
  Container,
  Stack,
  Paper,
  Box,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Link,
  Tooltip,
  Chip,
} from '@mui/material'
import ErrorIcon from '@mui/icons-material/ErrorOutlineOutlined'
import BigNumber from 'bignumber.js'
import PageTitle from 'components/PageTitle'
import Address from 'components/TruncatedAddress'
import Pagination from 'components/Pagination'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import {
  fetchTxList,
  API,
  useWS,
  getTxListRes,
  handleApiError,
  timeDistance,
  PAGE_SIZE,
  CHANNEL,
  CKB_DECIMAL,
} from 'utils'

type State = { query: Record<string, string>; txList: API.Txs.Parsed }

const TxList = (initState: State) => {
  const [
    {
      query: { account_id: id },
      txList,
    },
    setTxList,
  ] = useState(initState)
  const [t, { language }] = useTranslation('list')
  const [txT] = useTranslation('tx')
  const { push } = useRouter()

  useEffect(() => {
    setTxList(initState)
  }, [initState])

  useWS(
    `${CHANNEL.ACCOUNT_TX_LIST}${id}`,
    (init: API.Txs.Raw) => {
      setTxList(prev => (prev.txList.page === '1' ? { ...prev, txList: getTxListRes(init) } : prev))
    },
    (update: API.Txs.Raw) => {
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

  const handlePageChange = (e: React.SyntheticEvent<HTMLSelectElement>) => {
    const p = +e.currentTarget.value
    if (Number.isNaN(p) || p === +txList.page) {
      return
    }
    push(`/txs?account_id=${id}&page=${p}`)
  }
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
      <Paper sx={{ px: 1, py: 2 }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ textTransform: 'capitalize' }}>
              <TableRow>
                <TableCell component="th">{t('txHash')}</TableCell>
                <TableCell component="th">{t('block')} </TableCell>
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
                <TableCell component="th">{`${t('value')} (CKB)`}</TableCell>
                <TableCell component="th">{t('type')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {txList.txs.map(item => (
                <TableRow key={item.hash}>
                  <TableCell>
                    <Stack direction="row" alignItems="center">
                      {item.success ? null : <ErrorIcon color="warning" sx={{ fontSize: 16, mr: 1 }} />}
                      <Tooltip title={item.hash} placement="top">
                        <Box>
                          <NextLink href={`/tx/${item.hash}`}>
                            <Link href={`/tx/${item.hash}`} underline="none" color="secondary">
                              <Typography
                                fontSize={12}
                                className="mono-font"
                                overflow="hidden"
                                sx={{ userSelect: 'none' }}
                              >
                                {`${item.hash.slice(0, 8)}...${item.hash.slice(-8)}`}
                              </Typography>
                            </Link>
                          </NextLink>
                        </Box>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <NextLink href={`/block/${item.blockNumber}`}>
                      <Link href={`/block/${item.blockNumber}`} underline="none" color="secondary">
                        {(+item.blockNumber).toLocaleString('en')}
                      </Link>
                    </NextLink>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <time dateTime={new Date(+item.timestamp).toISOString()}>
                      {timeDistance(item.timestamp, language)}
                    </time>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Address address={item.from} />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Address address={item.to} />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'table-cell', md: 'none' } }}>
                    <Stack>
                      <Typography
                        variant="inherit"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        noWrap
                      >
                        <Typography fontSize={12} sx={{ textTransform: 'capitalize', mr: 1 }}>{`${t(
                          'from',
                        )}:`}</Typography>
                        <Address leading={5} address={item.from} />
                      </Typography>
                      <Typography
                        variant="inherit"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        noWrap
                      >
                        <Typography fontSize={12} sx={{ textTransform: 'capitalize', mr: 1 }}>{`${t(
                          'to',
                        )}:`}</Typography>
                        <Address leading={5} address={item.to} />
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{`${new BigNumber(item.value).dividedBy(CKB_DECIMAL).toFormat()}`}</TableCell>
                  <TableCell>
                    <Chip label={item.type} size="small" variant="outlined" color="primary" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          total={+txList.totalCount}
          current={+txList.page}
          onChange={handlePageChange}
          url={`/txs`}
          query={{ account_id: id }}
        />
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
