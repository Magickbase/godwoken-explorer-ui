import type { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useQuery } from 'react-query'
import { Skeleton } from '@mui/material'
import SubpageHead from 'components/SubpageHead'
import AccountOverview, {
  fetchAccountOverview,
  fetchAccountBalance,
  fetchDeployAddress,
  AccountOverviewProps,
  PolyjuiceContract,
} from 'components/AccountOverview'
import Tabs from 'components/Tabs'
import ERC20TransferList, { fetchTransferList } from 'components/ERC20TransferList'
import AssetList, { fetchUdtList } from 'components/AssetList'
import TxList, { fetchTxList } from 'components/TxList'
import BridgedRecordList from 'components/BridgedRecordList'
import ERC721InventoryList, {
  fetchInventoryListOfAccount as fetchERC721InventoryListOfAccount,
} from 'components/NFTInventoryList'
import ERC1155InventoryList, {
  fetchInventoryListOfAccount as fetchERC1155InventoryListOfAccount,
} from 'components/MultiTokenInventoryList'
import ContractInfo from 'components/ContractInfo'
import ContractEventsList from 'components/ContractEventsList'
import CopyBtn from 'components/CopyBtn'
import QRCodeBtn from 'components/QRCodeBtn'
import PageTitle from 'components/PageTitle'
import DownloadMenu, { DOWNLOAD_HREF_LIST } from 'components/DownloadMenu'
import TokenApprovalList, { fetchTokenApprovalList } from 'components/TokenApprovalList'
import { SIZES } from 'components/PageSize'
import { fetchBridgedRecordList, fetchEventLogsListByType, isEthAddress, GraphQLSchema, wagmiClient } from 'utils'
import { WagmiConfig } from 'wagmi'
import styles from './styles.module.scss'

const isSmartContractAccount = (account: AccountOverviewProps['account']): account is PolyjuiceContract => {
  return !!(account as PolyjuiceContract)?.smart_contract
}

const Account = () => {
  const {
    query: {
      id,
      tab = 'transactions',
      before = null,
      after = null,
      block_from = null,
      block_to = null,
      page = '1',
      page_size = SIZES[1],
      sort_time = 'ASC',
      sort_asset = 'ASC',
      sort_token_type = 'ASC',
      token_type = null,
      address_from = null,
      address_to = null,
      age_range_start = null,
      age_range_end = null,
      method_id = null,
      method_name = null,
    },
  } = useRouter()
  const [t] = useTranslation(['account', 'common'])

  const q = isEthAddress(id as string) ? { address: id as string } : { script_hash: id as string }

  const pageSize = Number.isNaN(+page_size) ? +SIZES[1] : +page_size

  const {
    isLoading: isOverviewLoading,
    data: account,
    refetch: refetchAccountOverview,
  } = useQuery(['account-overview', id], () => fetchAccountOverview(q), {
    refetchInterval: 10000,
    enabled: !!id,
  })
  const deployment_tx_hash = isSmartContractAccount(account) && account?.smart_contract?.deployment_tx_hash

  const { data: deployerAddr } = useQuery(
    ['deployer', deployment_tx_hash],
    () =>
      fetchDeployAddress({
        eth_hash: deployment_tx_hash,
      }),
    { enabled: !!deployment_tx_hash },
  )

  const { isLoading: isBalanceLoading, data: balance = '0' } = useQuery(
    ['account-balance', id],
    () => fetchAccountBalance(id as string),
    {
      refetchInterval: 10000,
      enabled: !!id && isEthAddress(id as string),
    },
  )

  const { isLoading: isTxListLoading, data: txList } = useQuery(
    [
      'account-tx-list',
      id,
      before,
      after,
      block_from,
      block_to,
      pageSize,
      address_from,
      address_to,
      age_range_start,
      age_range_end,
      method_id,
      method_name,
    ],
    () =>
      fetchTxList({
        ...q,
        before: before as string,
        after: after as string,
        start_block_number: block_from ? +block_from : null,
        end_block_number: block_to ? +block_to : null,
        limit: pageSize,
        status: null,
        address_from: address_from as string | null,
        address_to: address_to as string | null,
        age_range_start: age_range_start as string | null,
        age_range_end: age_range_end as string | null,
        method_id: method_id as string | null,
        method_name: method_name as string | null,
      }),
    {
      enabled: tab === 'transactions' && !!id,
    },
  )

  const {
    isLoading: isTransferListLoading,
    data: transferList,
    error: isTransferListError,
  } = useQuery(
    [
      'account-transfer-list',
      q.address,
      before,
      after,
      pageSize,
      block_from,
      block_to,
      address_from,
      address_to,
      age_range_start,
      age_range_end,
    ],
    () =>
      fetchTransferList({
        limit: pageSize,
        before: before as string,
        after: after as string,
        block_from: block_from ? +block_from : null,
        block_to: block_to ? +block_to : null,
        address_from: (address_from as string) || (address_to === q.address ? null : q.address),
        address_to: (address_to as string) || (address_from === q.address ? null : q.address),
        age_range_start: age_range_start as string,
        age_range_end: age_range_end as string,
        combine_from_to: !address_from && !address_to ? true : false,
      }),
    { enabled: tab === 'erc20' && !!q.address },
  )

  const { isLoading: isBridgedListLoading, data: bridgedRecordList } = useQuery(
    ['account-bridged-list', q.address, page],
    () => fetchBridgedRecordList({ eth_address: q.address, page: page as string }),
    { enabled: tab === 'bridged' && !!q.address },
  )

  const { isLoading: isEventListLoading, data: eventsList } = useQuery(
    ['account-event-list', q.address],
    () => fetchEventLogsListByType('accounts', q.address),
    { enabled: tab === 'events' && !!q.address },
  )

  const { isLoading: isUdtListLoading, data: udtList } = useQuery(
    ['account-udt-list', id],
    () => fetchUdtList(q.address ? { address_hashes: [id as string] } : { script_hashes: [id as string] }),
    { enabled: tab === 'assets' && !!(q.address || q.script_hash) },
  )

  const { isLoading: isERC721InventoryListLoading, data: erc721InventoryList } = useQuery(
    ['erc-721-inventory-list', id, before, after, pageSize],
    () =>
      fetchERC721InventoryListOfAccount({
        address: q.address,
        before: before as string,
        after: after as string,
        limit: pageSize,
      }),
    { enabled: tab === 'erc-721-assets' && !!q.address },
  )

  const { isLoading: isERC1155InventoryListLoading, data: erc1155InventoryList } = useQuery(
    ['erc-1155-inventory-list', id, before, after, pageSize],
    () =>
      fetchERC1155InventoryListOfAccount({
        address: q.address,
        before: before as string,
        after: after as string,
        limit: pageSize,
      }),
    { enabled: tab === 'erc-1155-assets' && !!q.address },
  )

  const { isLoading: isTokenApprovalsLoading, data: tokenApprovalsList } = useQuery(
    // TODO: add sorter after api ready
    ['account-token-approvals-list', id, token_type],
    () =>
      fetchTokenApprovalList({
        address: id as string,
        before: before as string,
        after: after as string,
        limit: +page_size,
        token_type: token_type as GraphQLSchema.TokenType,
        // TODO: add sorter after api ready
        // sorter: [
        //   { sort_type: sort_time as GraphQLSchema.SortType, sort_value: GraphQLSchema.TokenApprovalsSorter.Id },
        //   { sort_type: sort_asset as GraphQLSchema.SortType, sort_value: GraphQLSchema.TokenApprovalsSorter.Id },
        //   { sort_type: sort_token_type as GraphQLSchema.SortType, sort_value: GraphQLSchema.TokenApprovalsSorter.Id },
        // ],
      }),
    { enabled: tab === 'token-approvals' && !!id },
  )

  /* is script hash supported? */
  const downloadItems = account?.eth_address
    ? [
        { label: t('transactionRecords'), href: DOWNLOAD_HREF_LIST.accountTxList(account.eth_address) },
        { label: t('ERC20Records'), href: DOWNLOAD_HREF_LIST.accountTransferList(account.eth_address) },
        {
          label: t('bridgedRecords'),
          href: DOWNLOAD_HREF_LIST.accountBridgeRecordList(account.eth_address),
        },
      ]
    : []

  const title = account ? t(`accountType.${account.type}`) : <Skeleton animation="wave" width="200px" />
  const accountType = account?.type

  const tabs = [
    { label: t('transactionRecords'), key: 'transactions' },
    [GraphQLSchema.AccountType.EthUser, GraphQLSchema.AccountType.PolyjuiceContract].includes(accountType)
      ? { label: t(`ERC20Records`), key: 'erc20' }
      : null,
    [GraphQLSchema.AccountType.EthUser, GraphQLSchema.AccountType.PolyjuiceContract].includes(accountType)
      ? { label: t(`bridgedRecords`), key: 'bridged' }
      : null,
    [GraphQLSchema.AccountType.EthUser, GraphQLSchema.AccountType.PolyjuiceContract].includes(accountType)
      ? { label: t('erc20Assets'), key: 'assets' }
      : null,
    [GraphQLSchema.AccountType.EthUser, GraphQLSchema.AccountType.PolyjuiceContract].includes(accountType)
      ? { label: t('erc721Assets'), key: 'erc-721-assets' }
      : null,
    [GraphQLSchema.AccountType.EthUser, GraphQLSchema.AccountType.PolyjuiceContract].includes(accountType)
      ? { label: t('erc1155Assets'), key: 'erc-1155-assets' }
      : null,
    [GraphQLSchema.AccountType.EthUser].includes(accountType)
      ? { label: t('tokenApproval'), key: 'token-approvals' }
      : null,
    [GraphQLSchema.AccountType.PolyjuiceContract].includes(accountType) &&
    isSmartContractAccount(account) &&
    account.smart_contract?.abi
      ? { label: t('contract'), key: 'contract' }
      : null,
    [GraphQLSchema.AccountType.PolyjuiceContract].includes(accountType) ? { label: t('events'), key: 'events' } : null,
  ].filter(v => v)
  return (
    <>
      <SubpageHead subtitle={account ? `${title} ${id}` : (id as string)} />
      <div className={styles.container}>
        <div className={styles.title}>
          <PageTitle>{title}</PageTitle>
          {downloadItems.length ? <DownloadMenu items={downloadItems} /> : null}
        </div>
        <div className={styles.hash}>
          {id}
          <CopyBtn content={id as string} field={t('address', { ns: 'common' })} />
          <QRCodeBtn content={id as string} />
        </div>
        <AccountOverview
          isOverviewLoading={isOverviewLoading}
          isBalanceLoading={isBalanceLoading}
          account={account}
          balance={balance}
          deployerAddr={deployerAddr}
          refetch={refetchAccountOverview}
        />
        <div className={styles.list}>
          <Tabs
            value={tabs.findIndex(tabItem => tabItem.key === tab)}
            tabs={tabs.map((tabItem, idx) => ({
              label: tabItem.label,
              href: `/account/${id}?tab=${tabs[idx].key}`,
            }))}
          />
          {tab === 'transactions' ? (
            !isTxListLoading ? (
              <TxList
                transactions={txList ?? { entries: [], metadata: { total_count: 0, before: null, after: null } }}
                maxCount="100k"
                viewer={id as string}
              />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === 'erc20' ? (
            !isTransferListLoading && (transferList || isTransferListError) ? (
              <ERC20TransferList
                token_transfers={
                  transferList || { entries: [], metadata: { total_count: 0, before: null, after: null } }
                }
                viewer={id as string}
              />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === 'bridged' ? (
            !isBridgedListLoading && bridgedRecordList ? (
              <BridgedRecordList list={bridgedRecordList} />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === 'assets' ? (
            !isUdtListLoading && udtList ? (
              <AssetList list={udtList} />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === 'erc-721-assets' ? (
            !isERC721InventoryListLoading && erc721InventoryList ? (
              <ERC721InventoryList inventory={erc721InventoryList} viewer={q.address} />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === 'erc-1155-assets' ? (
            !isERC1155InventoryListLoading && erc1155InventoryList ? (
              <ERC1155InventoryList inventory={erc1155InventoryList} viewer={q.address} />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === 'token-approvals' ? (
            !isTokenApprovalsLoading && tokenApprovalsList ? (
              <WagmiConfig client={wagmiClient}>
                <TokenApprovalList list={tokenApprovalsList} />
              </WagmiConfig>
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === 'contract' && isSmartContractAccount(account) && account.smart_contract?.abi ? (
            <WagmiConfig client={wagmiClient}>
              <ContractInfo address={account.eth_address} contract={account.smart_contract} />
            </WagmiConfig>
          ) : null}
          {tab === 'events' ? (
            !isEventListLoading && eventsList ? (
              <ContractEventsList list={eventsList} />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: 'blocking',
})

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common', 'account', 'list', 'nft', 'multi-token'])
  return { props: lng }
}
export default Account
