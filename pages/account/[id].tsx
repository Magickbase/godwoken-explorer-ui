import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import NextLink from 'next/link'
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
  Link,
  Tabs,
  Tab,
  Typography,
} from '@mui/material'
import { ReadMore as ReadMoreIcon } from '@mui/icons-material'
import User from 'components/User'
import MetaContract from 'components/MetaContract'
import SmartContract from 'components/SmartContract'
import Polyjuice from 'components/Polyjuice'
import SUDT from 'components/SUDT'
import UdtList from 'components/UdtList'
import { fetchAccount, API, useWS, getAccountRes, handleApiError, formatBalance, CHANNEL, formatInt } from 'utils'
import PageTitle from 'components/PageTitle'

type State = API.Account.Parsed
const Account = (initState: State) => {
  const [account, setAccount] = useState(initState)
  const [t] = useTranslation('account')

  useEffect(() => {
    setAccount(initState)
  }, [setAccount, initState])

  useWS(
    `${CHANNEL.ACCOUNT_INFO}${account.id}`,
    (init: API.Account.Raw) => {
      setAccount(getAccountRes(init))
    },
    (update: API.Account.Raw) => {
      setAccount(getAccountRes(update))
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
                    secondary={
                      <NextLink href={`/txs?account_id=${account.id}&page=1`}>
                        <Link
                          href={`/txs?account_id=${account.id}&page=1`}
                          underline="none"
                          sx={{ color: 'secondary.main', display: 'flex', alignItems: 'center' }}
                        >
                          <Typography variant="body2">{formatInt(account.txCount)}</Typography>
                          {+account.txCount ? <ReadMoreIcon sx={{ ml: 0.5 }} /> : null}
                        </Link>
                      </NextLink>
                    }
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
          <Tabs value={0}>
            <Tab label={`${t('userDefinedAssets')} (${udtList.length})`} />
          </Tabs>
          <Divider />
          <UdtList list={udtList} />
        </Paper>
      </Stack>
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps<State, { id: string }> = async ({ locale, res, params }) => {
  const { id } = params
  try {
    const account = await fetchAccount(id)
    const lng = await serverSideTranslations(locale, ['common', 'account'])
    return { props: { ...account, ...lng } }
  } catch (err) {
    return handleApiError(err, res, locale, id)
  }
}
export default Account
