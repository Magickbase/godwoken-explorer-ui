import { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import {
  Container,
  Stack,
  Grid,
  Paper,
  Tabs,
  Tab,
  Divider,
  List,
  ListSubheader,
  ListItem,
  ListItemText,
  Avatar,
  Typography,
  Link,
} from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PageTitle from 'components/PageTitle'
import ERC20TransferList from 'components/ERC20TransferList'
import Pagination from 'components/Pagination'
import Address from 'components/AddressInHalfPanel'
import { API, handleApiError, fetchToken, fetchTxList, nameToColor } from 'utils'
import { PageNonPositiveException, PageOverflowException } from 'utils/exceptions'

type Props = {
  token: API.Token.Parsed
  txList: {
    txs: API.Txs.Parsed['txs']
    meta: Record<'current' | 'total', number>
  }
}

const Token = ({ token, txList }: Props) => {
  const [t] = useTranslation('tokens')
  const { push } = useRouter()
  const tokenInfo = [
    { label: 'decimal', value: <Typography variant="body2">{token.decimal || '-'}</Typography> },
    { label: 'type', value: <Typography variant="body2">{t(token.type)}</Typography> },
    {
      label: 'contract',
      value: token.shortAddress ? <Address address={token.shortAddress} /> : <Typography variant="body2">-</Typography>,
    },
    // {
    //   label: 'layer1Lock',
    //   value: token.typeScript.codeHash ? (
    //     <pre className="text-xs">{`{\n\t"code_hash": "${token.typeScript.codeHash}",\n\t"args": "${token.typeScript.args}",\n\t"hash_type": "${token.typeScript.hashType}"\n}`}</pre>
    //   ) : (
    //     '-'
    //   ),
    // },
    {
      label: 'officialSite',
      value: (
        <Typography variant="body2">
          {token.officialSite ? (
            <Link
              href={token.officialSite}
              underline="none"
              target="_blank"
              rel="noopener noreferrer"
              display="flex"
              alignItems="center"
              color="secondary"
            >
              <Typography variant="body2" overflow="hidden" textOverflow="ellipsis" className="mono-font">
                {token.officialSite}
              </Typography>
              <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
            </Link>
          ) : (
            '-'
          )}
        </Typography>
      ),
    },
    {
      label: 'description',
      value: <Typography variant="body2">{token.description || '-'}</Typography>,
    },
  ]
  const tokenData = [
    { label: 'totalSupply', value: <Typography variant="body2">{token.supply || '-'}</Typography> },
    // {label: 'value', value: token.supply ?? '-'},
    { label: 'holderCount', value: <Typography variant="body2">{token.holderCount || '-'}</Typography> },
    { label: 'transferCount', value: <Typography variant="body2">{token.transferCount || '-'}</Typography> },
  ]

  const handlePageChange = (e: React.SyntheticEvent<HTMLSelectElement>) => {
    const p = +e.currentTarget.value
    if (Number.isNaN(p) || p === txList.meta.current) {
      return
    }
    push(`/token/${token.id}?page=${p}`)
  }

  return (
    <Container sx={{ py: 6 }}>
      <PageTitle>
        <Stack direction="row" alignItems="center">
          <Avatar src={token.icon ?? null} sx={{ bgcolor: nameToColor(token.name ?? ''), mr: 2 }}>
            {token.name?.[0] ?? '?'}
          </Avatar>
          <Typography variant="h5" fontWeight="inherit">
            {token.name || '-'}
          </Typography>
          {token.symbol ? (
            <Typography fontWeight="inherit" color="primary.light" whiteSpace="pre">{` (${token.symbol})`}</Typography>
          ) : null}
        </Stack>
      </PageTitle>
      <Stack spacing={2}>
        <Paper>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <List subheader={<ListSubheader sx={{ bgcolor: 'transparent' }}>{t('tokenInfo')}</ListSubheader>}>
                <Divider variant="middle" />
                {tokenInfo.map(field => (
                  <ListItem key={field.label}>
                    <ListItemText primary={t(field.label)} secondary={field.value} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <List subheader={<ListSubheader sx={{ bgcolor: 'transparent' }}>{t('tokenData')}</ListSubheader>}>
                <Divider variant="middle" />
                {tokenData.map(field => (
                  <ListItem key={field.label}>
                    <ListItemText primary={t(field.label)} secondary={field.value} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Paper>
        <Paper>
          <Tabs value={0}>
            <Tab label={t('transfer-records')} />
          </Tabs>
          <Divider />
          <ERC20TransferList list={txList.txs} />
          <Pagination
            current={txList.meta.current}
            total={txList.meta.total * 10}
            onChange={handlePageChange}
            url={`/token/${token.id}`}
          />
        </Paper>
      </Stack>
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps<Props, { id: string }> = async ({ locale, res, params, query }) => {
  const { id } = params
  const { page } = query

  try {
    if (+page < 1) {
      throw new PageNonPositiveException()
    }
    const q = { account_id: id, tx_type: 'transfer' }
    if (typeof page === 'string' && !Number.isNaN(+page)) {
      q['page'] = page
    }

    const token = await fetchToken(id)
    const txListRes = await fetchTxList(q)
    const totalPage = Math.ceil(+txListRes.totalCount / 10)
    if (totalPage < +page) {
      throw new PageOverflowException(totalPage)
    }

    const lng = await serverSideTranslations(locale, ['common', 'tokens'])
    return {
      props: {
        token,
        txList: {
          txs: txListRes.txs,
          meta: {
            current: +txListRes.page,
            total: totalPage,
          },
        },
        ...lng,
      },
    }
  } catch (err) {
    switch (true) {
      case err instanceof PageNonPositiveException: {
        return {
          redirect: {
            destination: `/${locale}/token/${id}`,
            permanent: false,
          },
        }
      }
      case err instanceof PageOverflowException: {
        return {
          redirect: {
            destination: `/${locale}/token/${id}?page=${err.page}`,
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

export default Token
