import type { API } from 'utils/api/utils'
import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import {
  Alert,
  Stack,
  Container,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  ListSubheader,
  Tabs,
  Tab,
  Typography,
  Snackbar,
} from '@mui/material'
import { ContentCopyOutlined as CopyIcon } from '@mui/icons-material'
import SubpageHead from 'components/SubpageHead'
import User from 'components/User'
import MetaContract from 'components/MetaContract'
import SmartContract from 'components/SmartContract'
import Polyjuice from 'components/Polyjuice'
import SUDT from 'components/SUDT'
import ERC20TransferList from 'components/ERC20TransferList'
import UdtList from 'components/UdtList'
import TxList from 'components/TxList'
import {
  handleCopy,
  fetchAccount,
  useWS,
  getAccountRes,
  handleApiError,
  formatBalance,
  CHANNEL,
  formatInt,
  TabNotFoundException,
  fetchTxList,
  getTxListRes,
  getERC20TransferListRes,
  fetchERC20TransferList,
} from 'utils'
import PageTitle from 'components/PageTitle'

type ParsedTxList = ReturnType<typeof getTxListRes>
type ParsedTransferList = ReturnType<typeof getERC20TransferListRes>

type State = API.Account.Parsed & Partial<{ txList: ParsedTxList; transferList: ParsedTransferList }>
const tabs = ['transactions', 'erc20', 'assets']
const Account = (initState: State) => {
  const {
    push,
    query: { tab = 'transactions' },
  } = useRouter()
  const [account, setAccount] = useState(initState)
  const [isCopied, setIsCopied] = useState(false)
  const [t] = useTranslation(['account', 'common'])

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
    [setAccount, account.ethAddr],
  )
  const udtList = account.user?.udtList ?? (account.smartContract?.udtList || [])

  const handleAddressCopy = async () => {
    await handleCopy(account.ethAddr)
    setIsCopied(true)
  }

  const accountType = account.user
    ? 'user'
    : account.smartContract
    ? 'smartContract'
    : account.sudt
    ? 'sudt'
    : account.polyjuice
    ? 'polyjuice'
    : 'metaContract'

  const title = `${t('accountType.' + accountType)} ${account.ethAddr}`

  return (
    <>
      <SubpageHead subtitle={title} />
      <Container sx={{ py: 6 }}>
        <PageTitle>
          <Stack direction="row" alignItems="center">
            <Typography variant="inherit" overflow="hidden" textOverflow="ellipsis" noWrap>
              {title}
            </Typography>

            <IconButton aria-label="copy" onClick={handleAddressCopy}>
              <CopyIcon fontSize="inherit" />
            </IconButton>
          </Stack>
        </PageTitle>
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
                {account.smartContract ? <SmartContract /> : null}
                {account.polyjuice ? <Polyjuice {...account.polyjuice} /> : null}
                {account.sudt ? <SUDT {...account.sudt} /> : null}
              </Grid>
            </Grid>
          </Paper>
          <Paper>
            <Tabs value={tabs.indexOf(tab as string)}>
              {[t('transactionRecords'), t(`ERC20Records`), `${t('userDefinedAssets')} (${udtList.length})`].map(
                (label, idx) => (
                  <Tab
                    key={label}
                    label={label}
                    onClick={e => {
                      e.stopPropagation()
                      e.preventDefault()
                      push(`/account/${account.ethAddr}?tab=${tabs[idx]}`)
                    }}
                  />
                ),
              )}
            </Tabs>
            <Divider />
            {tab === 'transactions' && account.txList ? <TxList list={account.txList} /> : null}
            {tab === 'erc20' && account.transferList ? <ERC20TransferList list={account.transferList} /> : null}
            {tab === 'assets' ? <UdtList list={udtList} /> : null}
          </Paper>
        </Stack>
        <Snackbar
          open={isCopied}
          onClose={() => setIsCopied(false)}
          anchorOrigin={{
            horizontal: 'center',
            vertical: 'top',
          }}
          autoHideDuration={3000}
          color="secondary"
        >
          <Alert severity="success" variant="filled">
            {t(`addressCopied`, { ns: 'common' })}
          </Alert>
        </Snackbar>
      </Container>
    </>
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
      tab === 'transactions' && account.ethAddr
        ? await fetchTxList({ eth_address: account.ethAddr, page: query.page as string })
        : null
    const transferList =
      tab === 'erc20' && account.ethAddr
        ? await fetchERC20TransferList({ eth_address: account.ethAddr, page: query.page as string })
        : null
    return { props: { ...account, ...lng, txList, transferList } }
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
