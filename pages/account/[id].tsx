import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import {
  Stack,
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  ListSubheader,
  Tabs,
  Tab,
  Typography,
} from '@mui/material'
import User from 'components/User'
import MetaContract from 'components/MetaContract'
import SmartContract from 'components/SmartContract'
import Polyjuice from 'components/Polyjuice'
import SUDT from 'components/SUDT'
import UdtList from 'components/UdtList'
import TxList from 'components/TxList'
import {
  fetchAccount,
  API,
  useWS,
  getAccountRes,
  handleApiError,
  formatBalance,
  CHANNEL,
  formatInt,
  TabNotFoundException,
  fetchTxList,
} from 'utils'
import PageTitle from 'components/PageTitle'

type State = API.Account.Parsed & Partial<{ txList: API.Txs.Parsed }>
const tabs = ['transactions', 'assets']
const Account = (initState: State) => {
  const {
    push,
    query: { tab = 'transactions' },
  } = useRouter()
  const [account, setAccount] = useState(initState)
  const [t] = useTranslation('account')

  useEffect(() => {
    setAccount(initState)
  }, [setAccount, initState])

  useWS(
    `${CHANNEL.ACCOUNT_INFO}${account.id}`,
    (init: API.Account.Raw) => {
      setAccount(prev => ({ ...prev, ...getAccountRes(init) }))
    },
    (update: API.Account.Raw) => {
      setAccount(prev => ({ ...prev, ...getAccountRes(update) }))
    },
    [setAccount, account.id],
  )
  const udtList = account.user?.udtList ?? (account.smartContract?.udtList || [])

  return (
    <Container sx={{ py: 6 }}>
      <PageTitle>{`${t('account')} ${account.id}`}</PageTitle>
      <Stack spacing={2}>
        <Paper>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <List
                subheader={
                  <ListSubheader component="div" sx={{ textTransform: 'capitalize', bgcolor: 'transparent' }}>
                    {t(`overview`)}
                  </ListSubheader>
                }
                sx={{ textTransform: 'capitalize' }}
              >
                <Divider variant="middle" />
                <ListItem>
                  <ListItemText
                    primary={t(`ckbBalance`)}
                    secondary={<Typography variant="body2">{formatBalance(account.ckb) + ' CKB'}</Typography>}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={t(`ethBalance`)}
                    secondary={<Typography variant="body2">{formatBalance(account.eth) + ' Ether'}</Typography>}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={t(`txCount`)}
                    secondary={<Typography variant="body2">{formatInt(account.txCount)}</Typography>}
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              {account.metaContract ? <MetaContract {...account.metaContract} /> : null}
              {account.user ? <User {...account.user} /> : null}
              {account.smartContract ? <SmartContract {...account.smartContract} /> : null}
              {account.polyjuice ? <Polyjuice {...account.polyjuice} /> : null}
              {account.sudt ? <SUDT {...account.sudt} /> : null}
            </Grid>
          </Grid>
        </Paper>
        <Paper>
          <Tabs value={tabs.indexOf(tab as string)}>
            {[`${t('transactions')}`, `${t('userDefinedAssets')} (${udtList.length})`].map((label, idx) => (
              <Tab
                key={label}
                label={label}
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  push(`/account/${account.id}?tab=${tabs[idx]}`)
                }}
              />
            ))}
          </Tabs>
          <Divider />
          {tab === 'transactions' && account.txList ? <TxList list={account.txList} /> : null}
          {tab === 'assets' ? <UdtList list={udtList} /> : null}
        </Paper>
      </Stack>
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps<State, { id: string }> = async ({ locale, res, params, query }) => {
  const { id } = params
  const { tab = 'transactions' } = query
  try {
    if (typeof tab !== 'string' || !tabs.includes(tab)) {
      throw new TabNotFoundException()
    }

    const [account, lng] = await Promise.all([
      fetchAccount(id),
      serverSideTranslations(locale, ['common', 'account', 'list']),
      null,
    ])
    const txList =
      tab === 'transactions' ? await fetchTxList({ account_id: account.id, page: query.page as string }) : null
    return { props: { ...account, ...lng, txList } }
  } catch (err) {
    switch (true) {
      case err instanceof TabNotFoundException: {
        return {
          redirect: {
            destination: `/account/${id}?tab=transactions`,
            permanent: false,
          },
        }
      }
      default: {
        return handleApiError(err, res, locale, id)
      }
    }
  }
}
export default Account
