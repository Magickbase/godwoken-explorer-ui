import type { API } from 'utils/api/utils'
import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import BigNumber from 'bignumber.js'
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
import AssetList, { fetchUdtList, UdtList } from 'components/UdtList'
import TxList, { TxListProps, fetchTxList } from 'components/TxList'
import BridgedRecordList from 'components/BridgedRecordList'
import ContractInfo from 'components/ContractInfo'
import ContractEventsList from 'components/ContractEventsList'
import {
  handleCopy,
  fetchAccount,
  useWS,
  getAccountRes,
  handleApiError,
  formatInt,
  getERC20TransferListRes,
  fetchERC20TransferList,
  getBridgedRecordListRes,
  fetchBridgedRecordList,
  fetchEventLogsListByType,
  ParsedEventLog,
  TabNotFoundException,
  CHANNEL,
  GCKB_DECIMAL,
  CKB_DECIMAL,
  isEthAddress,
} from 'utils'
import PageTitle from 'components/PageTitle'

type ParsedTransferList = ReturnType<typeof getERC20TransferListRes>
type ParsedBridgedRecordList = ReturnType<typeof getBridgedRecordListRes>

type State = API.Account.Parsed &
  Partial<{
    txList: TxListProps['transactions']
    transferList: ParsedTransferList
    bridgedRecordList: ParsedBridgedRecordList
    udtList: UdtList
    eventsList: ParsedEventLog[]
  }>
const tabs = ['transactions', 'erc20', 'bridged', 'assets', 'contract', 'events']
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
    account.id ? `${CHANNEL.ACCOUNT_INFO}${account.id}` : ``,
    (init: API.Account.Raw) => {
      setAccount(prev => ({ ...prev, ...getAccountRes(init) }))
    },
    (update: API.Account.Raw) => {
      setAccount(prev => ({ ...prev, ...getAccountRes(update) }))
    },
    [setAccount, account.ethAddr],
  )

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
                      secondary={
                        <Typography variant="body2">
                          {/* FIXME: use response of graphql and GCKB_DECIMAL to foramt balance */}
                          {new BigNumber(account.ckb).multipliedBy(CKB_DECIMAL).dividedBy(GCKB_DECIMAL).toFormat() +
                            ' CKB'}
                        </Typography>
                      }
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
                {account.smartContract ? (
                  <SmartContract
                    deployer={account.smartContract.creatorAddress}
                    txHash={account.smartContract.deploymentTxHash}
                  />
                ) : null}
                {account.polyjuice ? <Polyjuice {...account.polyjuice} /> : null}
                {account.sudt ? <SUDT {...account.sudt} /> : null}
              </Grid>
            </Grid>
          </Paper>
          <Paper>
            <Tabs value={tabs.indexOf(tab as string)} variant="scrollable" scrollButtons="auto">
              {[
                t('transactionRecords'),
                t(`ERC20Records`),
                t(`bridgedRecords`),
                t('userDefinedAssets'),
                accountType === 'smartContract' && account.smartContract?.name ? t('contract') : null,
                accountType === 'smartContract' ? t('events') : null,
              ].map((label, idx) =>
                label ? (
                  <Tab
                    key={label}
                    label={label}
                    onClick={e => {
                      e.stopPropagation()
                      e.preventDefault()
                      push(`/account/${account.ethAddr}?tab=${tabs[idx]}`, undefined, { scroll: false })
                    }}
                  />
                ) : (
                  <Tab key="none" sx={{ display: 'none' }} />
                ),
              )}
            </Tabs>
            <Divider />
            {tab === 'transactions' && account.txList ? <TxList transactions={account.txList} maxCount="100k" /> : null}
            {tab === 'erc20' && account.transferList ? <ERC20TransferList list={account.transferList} /> : null}
            {tab === 'bridged' && account.bridgedRecordList ? (
              <BridgedRecordList list={account.bridgedRecordList} />
            ) : null}
            {tab === 'assets' && account.udtList ? <AssetList list={account.udtList} /> : null}
            {tab === 'contract' && account.smartContract?.name ? (
              <ContractInfo address={account.ethAddr} {...account.smartContract} />
            ) : null}
            {tab === 'events' && <ContractEventsList list={account.eventsList} />}
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
  const { tab = tabs[0], before = null, after = null } = query

  try {
    if (typeof tab !== 'string' || !tabs.includes(tab)) {
      throw new TabNotFoundException()
    }
    const q = isEthAddress(id) ? { eth_address: id } : { script_hash: id }

    const [account, lng] = await Promise.all([
      fetchAccount(id),
      serverSideTranslations(locale, ['common', 'account', 'list']),
      null,
    ])

    const txList =
      tab === 'transactions' && (q.eth_address || q.script_hash)
        ? await fetchTxList({ ...q, before: before as string, after: after as string })
        : null

    const transferList =
      tab === 'erc20' && q.eth_address
        ? await fetchERC20TransferList({ eth_address: q.eth_address, page: query.page as string })
        : null
    const bridgedRecordList =
      tab === 'bridged' && q.eth_address
        ? await fetchBridgedRecordList({ eth_address: q.eth_address, page: query.page as string })
        : null
    const eventsList =
      tab === 'events' && q.eth_address ? await fetchEventLogsListByType('accounts', q.eth_address) : null
    const udtList =
      tab === 'assets' && (q.eth_address || q.script_hash)
        ? await fetchUdtList(q.eth_address ? { address_hashes: [id] } : { script_hashes: [id] })
        : null

    return { props: { ...account, ...lng, txList, transferList, bridgedRecordList, udtList, eventsList } }
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
