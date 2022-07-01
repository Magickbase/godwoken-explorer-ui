import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import BigNumber from 'bignumber.js'
import { Alert, Stack, Container, Paper, IconButton, Divider, Tabs, Tab, Typography, Snackbar } from '@mui/material'
import { ContentCopyOutlined as CopyIcon } from '@mui/icons-material'
import SubpageHead from 'components/SubpageHead'
import AccountOverview, {
  fetchAccountOverview,
  fetchAccountBalance,
  fetchDeployAddress,
  AccountOverviewProps,
  PolyjuiceContract,
} from 'components/AccountOverview'
import ERC20TransferList from 'components/ERC20TransferList'
import AssetList, { fetchUdtList, UdtList } from 'components/UdtList'
import TxList, { TxListProps, fetchTxList } from 'components/TxList'
import BridgedRecordList from 'components/BridgedRecordList'
import ContractInfo from 'components/ContractInfo'
import ContractEventsList from 'components/ContractEventsList'
import {
  handleCopy,
  // useWS,
  // getAccountRes,
  handleApiError,
  getERC20TransferListRes,
  fetchERC20TransferList,
  getBridgedRecordListRes,
  fetchBridgedRecordList,
  fetchEventLogsListByType,
  isEthAddress,
  GraphQLSchema,
  ParsedEventLog,
  TabNotFoundException,
  NotFoundException,
  API_ENDPOINT,
  CKB_DECIMAL,
} from 'utils'
import PageTitle from 'components/PageTitle'

type ParsedTransferList = ReturnType<typeof getERC20TransferListRes>
type ParsedBridgedRecordList = ReturnType<typeof getBridgedRecordListRes>

type State = AccountOverviewProps &
  Partial<{
    txList: TxListProps['transactions']
    transferList: ParsedTransferList
    bridgedRecordList: ParsedBridgedRecordList
    udtList: UdtList
    eventsList: ParsedEventLog[]
  }>
const tabs = ['transactions', 'erc20', 'bridged', 'assets', 'contract', 'events']

const isSmartContractAccount = (account: AccountOverviewProps['account']): account is PolyjuiceContract => {
  return !!(account as PolyjuiceContract)?.smart_contract
}

const Account = (initState: State) => {
  const {
    push,
    query: { tab = 'transactions' },
  } = useRouter()
  const [accountAndList, setAccountAndList] = useState(initState)
  const [isCopied, setIsCopied] = useState(false)
  const [t] = useTranslation(['account', 'common'])

  const id = accountAndList.account.eth_address || accountAndList.account.script_hash

  useEffect(() => {
    setAccountAndList(initState)
  }, [setAccountAndList, initState])

  // TODO: update balance and tx count actively
  // useWS(
  //   account.id ? `${CHANNEL.ACCOUNT_INFO}${account.id}` : ``,
  //   (init: API.Account.Raw) => {
  //     setAccount(prev => ({ ...prev, ...getAccountRes(init) }))
  //   },
  //   (update: API.Account.Raw) => {
  //     setAccount(prev => ({ ...prev, ...getAccountRes(update) }))
  //   },
  //   [setAccount, account.ethAddr],
  // )

  const handleAddressCopy = async () => {
    await handleCopy(id)
    setIsCopied(true)
  }

  const title = `${t('accountType.' + accountAndList.account.type)} ${id}`
  const accountType = accountAndList.account.type

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
          <AccountOverview
            account={accountAndList.account}
            balance={accountAndList.balance}
            deployerAddr={accountAndList.deployerAddr}
          />
          <Paper>
            <Tabs value={tabs.indexOf(tab as string)} variant="scrollable" scrollButtons="auto">
              {[
                t('transactionRecords'),
                [GraphQLSchema.AccountType.EthUser, GraphQLSchema.AccountType.PolyjuiceContract].includes(accountType)
                  ? t(`ERC20Records`)
                  : null,
                [GraphQLSchema.AccountType.EthUser, GraphQLSchema.AccountType.PolyjuiceContract].includes(accountType)
                  ? t(`bridgedRecords`)
                  : null,
                [GraphQLSchema.AccountType.EthUser, GraphQLSchema.AccountType.PolyjuiceContract].includes(accountType)
                  ? t('userDefinedAssets')
                  : null,
                [GraphQLSchema.AccountType.PolyjuiceContract].includes(accountType) &&
                isSmartContractAccount(accountAndList.account) &&
                accountAndList.account.smart_contract?.abi
                  ? t('contract')
                  : null,
                [GraphQLSchema.AccountType.PolyjuiceContract].includes(accountType) ? t('events') : null,
              ].map((label, idx) =>
                label ? (
                  <Tab
                    key={label}
                    label={label}
                    onClick={e => {
                      e.stopPropagation()
                      e.preventDefault()
                      push(`/account/${id}?tab=${tabs[idx]}`, undefined, { scroll: false })
                    }}
                  />
                ) : (
                  <Tab key="none" sx={{ display: 'none' }} />
                ),
              )}
            </Tabs>
            <Divider />
            {tab === 'transactions' && accountAndList.txList ? (
              <TxList transactions={accountAndList.txList} maxCount="100k" />
            ) : null}
            {tab === 'erc20' && accountAndList.transferList ? (
              <ERC20TransferList list={accountAndList.transferList} />
            ) : null}
            {tab === 'bridged' && accountAndList.bridgedRecordList ? (
              <BridgedRecordList list={accountAndList.bridgedRecordList} />
            ) : null}
            {tab === 'assets' && accountAndList.udtList ? <AssetList list={accountAndList.udtList} /> : null}
            {tab === 'contract' &&
            isSmartContractAccount(accountAndList.account) &&
            accountAndList.account.smart_contract?.abi ? (
              <ContractInfo
                address={accountAndList.account.eth_address}
                contract={accountAndList.account.smart_contract}
              />
            ) : null}
            {tab === 'events' && <ContractEventsList list={accountAndList.eventsList} />}
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
  const { tab = tabs[0], before = null, after = null, block_from = null, block_to = null } = query

  try {
    if (typeof tab !== 'string' || !tabs.includes(tab)) {
      throw new TabNotFoundException()
    }
    const q = isEthAddress(id) ? { address: id } : { script_hash: id }

    const [account, _balance, lng] = await Promise.all([
      fetchAccountOverview(q),
      fetchAccountBalance(q.address ? { address_hashes: [q.address] } : { script_hashes: [q.script_hash] }),
      serverSideTranslations(locale, ['common', 'account', 'list']),
      null,
    ])

    if (!account) {
      throw new NotFoundException()
    }

    const balance = await fetch(`${API_ENDPOINT}/accounts/${account.eth_address}`)
      .then(r => r.json())
      .then(a => new BigNumber(a.ckb).multipliedBy(new BigNumber(CKB_DECIMAL)).toString())
      .catch(() => _balance)

    const txList =
      tab === 'transactions' && (q.address || q.script_hash)
        ? await fetchTxList({
            ...q,
            before: before as string,
            after: after as string,
            start_block_number: block_from ? +block_from : null,
            end_block_number: block_to ? +block_to : null,
          })
        : null

    const transferList =
      tab === 'erc20' && q.address
        ? await fetchERC20TransferList({ eth_address: q.address, page: query.page as string })
        : null
    const bridgedRecordList =
      tab === 'bridged' && q.address
        ? await fetchBridgedRecordList({ eth_address: q.address, page: query.page as string })
        : null
    const eventsList = tab === 'events' && q.address ? await fetchEventLogsListByType('accounts', q.address) : null
    const udtList =
      tab === 'assets' && (q.address || q.script_hash)
        ? await fetchUdtList(q.address ? { address_hashes: [id] } : { script_hashes: [id] })
        : null

    const deployerAddr =
      isSmartContractAccount(account) && account.smart_contract?.deployment_tx_hash
        ? await fetchDeployAddress({ eth_hash: account.smart_contract.deployment_tx_hash })
        : null

    return {
      props: { ...lng, account, deployerAddr, balance, txList, transferList, bridgedRecordList, udtList, eventsList },
    }
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
