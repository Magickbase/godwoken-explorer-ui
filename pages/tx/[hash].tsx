import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ReactNode } from 'react'
import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { Skeleton } from '@mui/material'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import Tabs from 'components/Tabs'
import SubpageHead from 'components/SubpageHead'
import PageTitle from 'components/PageTitle'
import InfoList, { InfoItemProps } from 'components/InfoList'
import CommonERCTransferlist, { fetchERCTransferList } from 'components/CommonERCTransferlist'
import TxLogsList from 'components/TxLogsList'
import RawTxData from 'components/RawTxData'
import DownloadMenu, { DOWNLOAD_HREF_LIST } from 'components/DownloadMenu'
import TxType from 'components/TxType'
import HashLink from 'components/HashLink'
import Amount from 'components/Amount'
import { SIZES } from 'components/PageSize'
import Tooltip from 'components/Tooltip'
import PolyjuiceStatus from 'components/PolyjuiceStatus'
import Address from 'components/TruncatedAddress'
import { TransferlistType } from 'components/BaseTransferlist'
import ResponsiveHash from 'components/ResponsiveHash'
import ExpandIcon from 'assets/icons/expand.svg'
import {
  formatDatetime,
  GraphQLSchema,
  client,
  getAddressDisplay,
  CKB_EXPLORER_URL,
  PCKB_UDT_INFO,
  provider,
} from 'utils'
import styles from './styles.module.scss'

const tabs = ['erc20Records', 'erc721Records', 'erc1155Records', 'logs', 'rawData']

interface Transaction {
  hash: string
  type: GraphQLSchema.TransactionType
  nonce: number
  index: number
  method_id: string | null
  method_name: string | null
  from_account: Pick<
    GraphQLSchema.Account,
    'eth_address' | 'type' | 'smart_contract' | 'script_hash' | 'bit_alias'
  > | null
  to_account: Pick<
    GraphQLSchema.Account,
    'eth_address' | 'type' | 'smart_contract' | 'script_hash' | 'bit_alias'
  > | null
  polyjuice: Pick<
    GraphQLSchema.Polyjuice,
    | 'tx_hash'
    | 'status'
    | 'input'
    | 'created_contract_address_hash'
    | 'native_transfer_address_hash'
    | 'value'
    | 'gas_used'
    | 'gas_limit'
    | 'gas_price'
    | 'call_contract'
    | 'call_data'
    | 'call_gas_limit'
    | 'verification_gas_limit'
    | 'max_fee_per_gas'
    | 'max_priority_fee_per_gas'
    | 'paymaster_and_data'
    | 'native_transfer_account'
  > | null
  polyjuice_creator: Pick<GraphQLSchema.PolyjuiceCreator, 'created_account'> | null
  block: Pick<GraphQLSchema.Block, 'number' | 'hash' | 'timestamp' | 'status' | 'layer1_block_number'>
}

const txQuery = gql`
  fragment Tx on Transaction {
    hash
    type
    nonce
    index
    method_id
    method_name
    from_account {
      eth_address
      type
      bit_alias
    }
    to_account {
      eth_address
      type
      bit_alias
      script_hash
      smart_contract {
        name
        abi
      }
    }
    polyjuice {
      tx_hash
      status
      input
      created_contract_address_hash
      native_transfer_address_hash
      value
      gas_used
      gas_limit
      gas_price
      call_contract
      call_data
      call_gas_limit
      verification_gas_limit
      max_fee_per_gas
      max_priority_fee_per_gas
      paymaster_and_data
      native_transfer_account {
        bit_alias
        eth_address
      }
    }
    polyjuice_creator {
      created_account {
        eth_address
        type
      }
    }
    block {
      number
      hash
      timestamp
      status
      layer1_block_number
    }
  }
  query ($hash: HashFull) {
    eth_transaction: transaction(input: { transaction_hash: $hash }) {
      ...Tx
    }

    gw_transaction: transaction(input: { eth_hash: $hash }) {
      ...Tx
    }
  }
`

const getAbiListQuery = (addrList: Array<string>) => {
  const queryBody = addrList.map(
    addr => `contract_${addr}: smart_contract( input: { contract_address: "${addr}"}) {
    abi
  }`,
  )
  return gql`query {
  ${queryBody.join('\n')}
}
`
}

const Tx = () => {
  const {
    query: {
      hash,
      tab = 'erc20Records',
      before = null,
      after = null,
      address_from = null,
      address_to = null,
      page_size = SIZES[1],
      log_index_sort = 'ASC',
    },
    replace,
  } = useRouter()

  const [t, { language }] = useTranslation('tx')
  const [isFinalized, setIsFinalized] = useState(false)

  const { isLoading: isTxLoading, data: txs } = useQuery(
    ['tx', hash],
    () => client.request<Record<'eth_transaction' | 'gw_transaction', Transaction>>(txQuery, { hash }),
    {
      enabled: !!hash,
      refetchInterval: isFinalized ? undefined : 10000,
    },
  )
  const tx = txs?.eth_transaction ?? txs?.gw_transaction

  const commonParams = {
    transaction_hash: hash as string,
    before: before as string | null,
    after: after as string | null,
    from_address: address_from as string | null,
    to_address: address_to as string | null,
    combine_from_to: false,
    limit: Number.isNaN(+page_size) ? +SIZES[1] : +page_size,
    log_index_sort: log_index_sort as 'ASC' | 'DESC',
  }
  const commonNameArr = [hash, before, after, address_from, address_to, log_index_sort, page_size]

  const { isLoading: isTransferListLoading, data: transferList } = useQuery(
    ['tx-transfer-list', ...commonNameArr],
    () => fetchERCTransferList(commonParams, TransferlistType.Erc20),
    {
      enabled: tab === 'erc20Records',
    },
  )

  const { isLoading: isErc721TransferListLoading, data: erc721TransferList } = useQuery(
    ['tx-erc721-transfer-list', ...commonNameArr],
    () => fetchERCTransferList(commonParams, TransferlistType.Erc721),
    {
      enabled: tab === 'erc721Records',
    },
  )

  const { isLoading: isErc1155TransferListLoading, data: erc1155TransferList } = useQuery(
    ['tx-erc1155-transfer-list', ...commonNameArr],
    () => fetchERCTransferList(commonParams, TransferlistType.Erc1155),
    {
      enabled: tab === 'erc1155Records',
    },
  )

  const { isLoading: isTxReceiptLoading, data: txReceipt } = useQuery(
    ['tx-receipt-ethers', hash],
    () => provider.getTransactionReceipt(hash as string),
    {
      enabled: tab === 'logs',
    },
  )

  const contractAddrList = [...new Set(txReceipt?.logs.map(log => log.address.toLowerCase()))]

  const { data: abiList = {} } = useQuery<Record<string, { abi: Array<any> | null }>>(
    ['contract-abi-list', contractAddrList.join(',')],
    contractAddrList.length
      ? () => client.request<Record<string, { abi: Array<any> | null }>>(getAbiListQuery(contractAddrList))
      : null,
  )

  useEffect(() => {
    if (tx?.block?.status === GraphQLSchema.BlockStatus.Finalized) {
      setIsFinalized(true)
    }
  }, [tx, setIsFinalized])

  if (!isTxLoading && !tx) {
    replace(`${language}/404?query=${hash}`)
  }

  const downloadItems = [{ label: t('ERC20Records'), href: DOWNLOAD_HREF_LIST.txTransferList(hash as string) }]

  const decodedInput = useMemo(() => {
    if (tx && tx.to_account?.smart_contract?.abi?.length && tx.polyjuice?.input) {
      try {
        const i = new ethers.utils.Interface(tx.to_account.smart_contract.abi)
        return i.parseTransaction({ data: tx.polyjuice.input })
      } catch (err) {
        console.error(err)
        return null
      }
    }
    return null
  }, [tx?.to_account?.smart_contract?.abi, tx?.polyjuice?.input])

  const utf8Input = useMemo(() => {
    if (tx?.polyjuice?.input) {
      try {
        return ethers.utils.toUtf8String(tx.polyjuice.input)
      } catch {
        return null
      }
    }
    return null
  }, [tx?.polyjuice?.input])

  const inputContents = [
    { type: 'raw', text: tx?.polyjuice?.input },
    decodedInput
      ? {
          type: 'decoded',
          text: `Function: ${decodedInput.signature}\n\nMethodID: ${decodedInput.sighash}\n${decodedInput.args
            .map((a, i) => '[' + i + ']: ' + a)
            .join('\n')}`,
        }
      : null,
    utf8Input ? { type: 'utf8', text: utf8Input } : null,
  ].filter(v => v)

  const gasPrice = tx?.polyjuice?.gas_price
  const isGasless = gasPrice === '0'
  const getGasPriceDisplayValue = (): ReactNode => {
    return isGasless ? 'Gasless' : <Amount amount={gasPrice} udt={PCKB_UDT_INFO} showSymbol />
  }

  const fromAddrDisplay = getAddressDisplay(tx?.from_account)
  const toAddrDisplay = getAddressDisplay(tx?.to_account, tx?.polyjuice?.native_transfer_account?.eth_address)

  const method = tx?.method_name ?? tx?.method_id
  const from_bit_alias = tx?.from_account?.bit_alias
  const to_bit_alias = tx?.polyjuice?.native_transfer_account?.bit_alias

  const overview: InfoItemProps[] = [
    {
      field: t('hash'),
      content: <ResponsiveHash label={hash as string} btnRight="copy" copyAlertText={t('hash')} />,
    },
    {
      field: t('from'),
      content: isTxLoading ? (
        <Skeleton animation="wave" />
      ) : tx ? (
        from_bit_alias ? (
          <HashLink
            label={<Address address={fromAddrDisplay.label} domain={from_bit_alias} />}
            href={`/address/${fromAddrDisplay.address}`}
          />
        ) : (
          <ResponsiveHash label={fromAddrDisplay.label} href={`/address/${fromAddrDisplay.address}`} />
        )
      ) : (
        t('pending')
      ),
    },
    {
      field: t(tx?.to_account?.smart_contract ? 'interactedContract' : 'to'),
      content: isTxLoading ? (
        <Skeleton animation="wave" />
      ) : tx ? (
        to_bit_alias ? (
          <HashLink
            label={to_bit_alias ? <Address address={toAddrDisplay.label} domain={to_bit_alias} /> : toAddrDisplay.label}
            href={`/address/${toAddrDisplay.address}`}
          />
        ) : (
          <ResponsiveHash label={toAddrDisplay.label} href={`/address/${toAddrDisplay.address}`} />
        )
      ) : (
        t('pending')
      ),
    },
    tx?.polyjuice?.created_contract_address_hash
      ? {
          field: t('deployed_contract'),
          content: (
            <HashLink
              label={tx.polyjuice.created_contract_address_hash}
              href={`/address/${tx.polyjuice.created_contract_address_hash}`}
            />
          ),
        }
      : null,
    tx?.polyjuice_creator?.created_account?.eth_address
      ? {
          field: t('created_account'),
          content: (
            <HashLink
              label={tx.polyjuice_creator.created_account.eth_address}
              href={`/address/${tx.polyjuice_creator.created_account.eth_address}`}
            />
          ),
        }
      : null,
    tx?.type === GraphQLSchema.TransactionType.Polyjuice
      ? {
          field: t('value'),
          content: tx?.polyjuice?.value ? (
            <div className={styles.value}>
              <Amount amount={tx?.polyjuice?.value || '0'} udt={PCKB_UDT_INFO} showSymbol />
            </div>
          ) : (
            t('pending')
          ),
        }
      : null,
    method
      ? {
          field: t('method'),
          content: (
            <Tooltip title={tx?.method_id || false} placement="top">
              <span className="mono-font">{method}</span>
            </Tooltip>
          ),
        }
      : null,
    tx?.polyjuice?.input
      ? {
          field: t('input'),
          content: (
            <details className={styles.input}>
              <summary>
                {t('check')}
                <ExpandIcon />
              </summary>
              <pre>
                {inputContents.map(content => (
                  <dl key={content.type} className={styles.decodedInput}>
                    <dt>{content.type}</dt>
                    <dd>{content.text}</dd>
                  </dl>
                ))}
              </pre>
            </details>
          ),
          expandable: true,
        }
      : null,
  ]

  const isPolyjuiceTx = tx?.type === GraphQLSchema.TransactionType.Polyjuice

  const basicInfo = [
    {
      field: t('finalizeState'),
      content: tx ? t(tx?.block?.status.toLowerCase() ?? 'pending') : <Skeleton animation="wave" />,
    },
    {
      field: t('type'),
      content: tx ? <TxType type={tx?.type} /> : <Skeleton animation="wave" />,
    },
    {
      field: t('l1Block'),
      content: tx?.block?.layer1_block_number ? (
        <HashLink
          label={tx.block.layer1_block_number.toLocaleString('en')}
          href={`${CKB_EXPLORER_URL}/block/${tx.block.layer1_block_number}`}
          external
        />
      ) : (
        t('pending')
      ),
    },
    {
      field: t('l2Block'),
      content: tx?.block?.number ? (
        <HashLink label={tx.block.number.toLocaleString('en')} href={`/block/${tx.block.number}`} />
      ) : (
        t('pending')
      ),
    },
    { field: t('index'), content: tx?.index ?? (isPolyjuiceTx ? t('pending') : '-') },
    { field: t('nonce'), content: tx ? (tx.nonce || 0).toLocaleString('en') : <Skeleton animation="wave" /> },
    {
      field: t('status'),
      content: tx?.polyjuice ? (
        <PolyjuiceStatus status={tx.polyjuice.status ?? GraphQLSchema.PolyjuiceStatus.Pending} />
      ) : tx?.type === GraphQLSchema.TransactionType.Polyjuice ? (
        <Skeleton animation="wave" />
      ) : (
        '-'
      ),
    },
    {
      field: t('gasPrice'),
      content: tx?.polyjuice?.gas_price ? (
        <span className={styles.gasPrice}>{getGasPriceDisplayValue()}</span>
      ) : isTxLoading ? (
        <Skeleton animation="wave" />
      ) : isPolyjuiceTx ? (
        t('pending')
      ) : (
        '-'
      ),
    },
    {
      field: t('gasUsed'),
      content:
        tx && tx.polyjuice?.gas_used ? (
          new BigNumber(tx.polyjuice.gas_used).toFormat()
        ) : isTxLoading ? (
          <Skeleton animation="wave" />
        ) : isPolyjuiceTx ? (
          t('pending')
        ) : (
          '-'
        ),
    },
    {
      field: t('gasLimit'),
      content: tx?.polyjuice?.gas_limit ? (
        new BigNumber(tx.polyjuice.gas_limit).toFormat()
      ) : isTxLoading ? (
        <Skeleton animation="wave" />
      ) : isPolyjuiceTx ? (
        t('pending')
      ) : (
        '-'
      ),
    },
    {
      field: t('fee'),
      content:
        tx && tx.polyjuice?.gas_price && tx.polyjuice.gas_used ? (
          <span className={styles.gasFee}>
            {isGasless ? (
              'Gasless'
            ) : (
              <Amount
                amount={`${new BigNumber(tx.polyjuice.gas_used).times(new BigNumber(tx.polyjuice.gas_price))}`}
                udt={PCKB_UDT_INFO}
                showSymbol
              />
            )}
          </span>
        ) : isTxLoading ? (
          <Skeleton animation="wave" />
        ) : isPolyjuiceTx ? (
          t('pending')
        ) : (
          '-'
        ),
    },
    {
      field: t('timestamp'),
      content: tx?.block?.timestamp ? (
        <time dateTime={new Date(tx.block.timestamp).toISOString()}>{formatDatetime(tx.block.timestamp)}</time>
      ) : (
        t('pending')
      ),
    },
  ]

  const paymaster = tx?.polyjuice?.paymaster_and_data ? tx.polyjuice.paymaster_and_data.slice(0, 42) : null
  const paymasterData = tx?.polyjuice?.paymaster_and_data ? tx.polyjuice.paymaster_and_data.slice(42) : null

  const userOperations: InfoItemProps[] = [
    {
      field: t('call_contract'),
      content: tx?.polyjuice?.call_contract ? (
        <ResponsiveHash label={tx.polyjuice.call_contract} href={`/address/${tx.polyjuice.call_contract}`} />
      ) : (
        '-'
      ),
    },
    { field: t('call_gas_limit'), content: new BigNumber(tx?.polyjuice?.call_gas_limit).toFormat() || '-' },
    {
      field: t('verification_gas_limit'),
      content: new BigNumber(tx?.polyjuice?.verification_gas_limit).toFormat() || '-',
    },
    {
      field: t('paymaster'),
      content: paymaster ? <ResponsiveHash label={paymaster} href={`/address/${paymaster}`} /> : '-',
      colSpan: 2,
    },
    {
      field: t('max_fee_per_gas'),
      content: tx?.polyjuice?.max_fee_per_gas ? (
        <span className={styles.gasFee}>
          <Amount amount={tx.polyjuice.max_fee_per_gas} udt={PCKB_UDT_INFO} showSymbol />
        </span>
      ) : (
        '-'
      ),
    },
    {
      field: t('max_priority_fee_per_gas'),
      ddClassName: styles.priorityGasFee,
      content: tx?.polyjuice?.max_priority_fee_per_gas ? (
        <span className={styles.gasFee}>
          <Amount amount={tx.polyjuice.max_priority_fee_per_gas} udt={PCKB_UDT_INFO} showSymbol />
        </span>
      ) : (
        '-'
      ),
    },

    {
      field: t('paymaster_data'),
      content: paymasterData ? (
        <Tooltip title={paymasterData} placement="top">
          <div className={styles.paymasterData}>{`0x${paymasterData}`}</div>
        </Tooltip>
      ) : (
        '-'
      ),
    },
    {
      field: t('call_data'),
      content: tx?.polyjuice?.call_data ? (
        <details className={styles.input}>
          <summary>
            {t('check')}
            <ExpandIcon />
          </summary>
          <pre>
            <dl className={styles.decodedInput}>
              <dd>{tx.polyjuice.call_data}</dd>
            </dl>
          </pre>
        </details>
      ) : (
        '-'
      ),
      expandable: true,
      colSpan: 2,
    },
  ]

  const title = t('txInfo')

  return (
    <>
      <SubpageHead subtitle={`${title} ${hash}`} />
      <div className={styles.container} data-page-name="transaction-detail">
        <PageTitle>
          <div className={styles.title}>
            {title}
            <DownloadMenu items={downloadItems} />
          </div>
        </PageTitle>
        <InfoList title={t(`overview`)} list={overview} style={{ marginBottom: '2rem' }} />
        <InfoList title={t(`basicInfo`)} list={basicInfo} style={{ marginBottom: '2rem' }} type="two-columns" />
        {isGasless ? (
          <InfoList
            title={t(`userOperations`)}
            list={userOperations}
            style={{ marginBottom: '2rem' }}
            type="two-columns"
          />
        ) : null}
        <div className={styles.list}>
          <Tabs
            value={tabs.indexOf(tab as string)}
            tabs={tabs.map(label => ({
              label: t(label),
              href: `/tx/${hash}?tab=${label}`,
            }))}
          />
          {tab === 'erc20Records' ? (
            transferList || !isTransferListLoading ? (
              <CommonERCTransferlist transferlistType={TransferlistType.Erc20} token_transfers={transferList} />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === 'erc721Records' ? (
            erc721TransferList || !isErc721TransferListLoading ? (
              <CommonERCTransferlist
                transferlistType={TransferlistType.Erc721}
                erc721_token_transfers={erc721TransferList}
              />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === 'erc1155Records' ? (
            erc1155TransferList || !isErc1155TransferListLoading ? (
              <CommonERCTransferlist
                transferlistType={TransferlistType.Erc1155}
                erc1155_token_transfers={erc1155TransferList}
              />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === 'logs' ? (
            txReceipt && !isTxReceiptLoading ? (
              <TxLogsList list={txReceipt.logs} abiList={abiList} />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === 'rawData' && tx ? <RawTxData hash={hash as string} /> : null}
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
  const lng = await serverSideTranslations(locale, ['common', 'tx', 'list'])
  return { props: lng }
}

export default Tx
