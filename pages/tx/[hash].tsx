import type { GetStaticPaths, GetStaticProps } from 'next'
import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useQuery } from 'react-query'
import { gql } from 'graphql-request'
import { Skeleton } from '@mui/material'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import Tooltip from 'components/Tooltip'
import Tabs from 'components/Tabs'
import SubpageHead from 'components/SubpageHead'
import PageTitle from 'components/PageTitle'
import InfoList from 'components/InfoList'
import TransferList, { fetchTransferList } from 'components/SimpleERC20Transferlist'
import TxLogsList from 'components/TxLogsList'
import RawTxData from 'components/RawTxData'
import CopyBtn from 'components/CopyBtn'
import DownloadMenu, { DOWNLOAD_HREF_LIST } from 'components/DownloadMenu'
import TxType from 'components/TxType'
import HashLink from 'components/HashLink'
import Amount from 'components/Amount'
import { SIZES } from 'components/PageSize'
import PolyjuiceStatus from 'components/PolyjuiceStatus'
import ExpandIcon from 'assets/icons/expand.svg'
import {
  formatDatetime,
  fetchEventLogsListByType,
  GraphQLSchema,
  client,
  CKB_EXPLORER_URL,
  PCKB_UDT_INFO,
  ZERO_ADDRESS,
} from 'utils'
import styles from './styles.module.scss'

const tabs = ['erc20', 'logs', 'raw-data']

interface Transaction {
  hash: string
  type: GraphQLSchema.TransactionType
  nonce: number
  index: number
  method_id: string | null
  method_name: string | null
  from_account: Pick<GraphQLSchema.Account, 'eth_address' | 'type'> | null
  to_account: Pick<GraphQLSchema.Account, 'eth_address' | 'type' | 'smart_contract'> | null
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
    }
    to_account {
      eth_address
      type
    }
    to_account {
      eth_address
      type
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

const Tx = () => {
  const {
    query: {
      hash,
      tab = 'erc20',
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

  const { isLoading: isTransferListLoading, data: transferList } = useQuery(
    ['tx-transfer-list', hash, before, after, address_from, address_to, log_index_sort, page_size],
    () =>
      fetchTransferList({
        transaction_hash: hash as string,
        before: before as string | null,
        after: after as string | null,
        from_address: address_from as string | null,
        to_address: address_to as string | null,
        combine_from_to: false,
        limit: Number.isNaN(+page_size) ? +SIZES[1] : +page_size,
        log_index_sort: log_index_sort as 'ASC' | 'DESC',
      }),
    {
      enabled: tab === 'erc20',
    },
  )

  const { isLoading: isLogListLoading, data: logsList } = useQuery(
    ['tx-log-list', hash],
    () => fetchEventLogsListByType('txs', hash as string).then(logList => logList.reverse()),
    {
      enabled: tab === 'logs',
    },
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

  const from = tx?.from_account?.eth_address
  let toLabel = tx?.to_account?.eth_address || 'zero address'
  let toAddr = tx?.to_account?.eth_address ?? ZERO_ADDRESS

  if (tx?.polyjuice?.native_transfer_address_hash) {
    toLabel = tx.polyjuice.native_transfer_address_hash
    toAddr = tx.polyjuice.native_transfer_address_hash
  } else if (tx?.to_account?.smart_contract?.name) {
    toLabel = `${tx.to_account.smart_contract.name} (${tx.to_account?.eth_address})`
  } else if (
    [
      GraphQLSchema.AccountType.EthAddrReg,
      GraphQLSchema.AccountType.MetaContract,
      GraphQLSchema.AccountType.PolyjuiceCreator,
    ].includes(tx?.to_account?.type)
  ) {
    toLabel = tx.to_account.type.replace(/_/g, ' ').toLowerCase()
  }

  const method = tx?.method_name ?? tx?.method_id

  const overview = [
    {
      field: t('hash'),
      content: (
        <div className={styles.hash}>
          <span className="mono-font">{hash as string}</span>
          <CopyBtn content={hash as string} field={t('hash')} />
        </div>
      ),
    },
    {
      field: t('from'),
      content: isTxLoading ? (
        <Skeleton animation="wave" />
      ) : tx ? (
        <HashLink label={from} href={`/address/${from}`} style={{ wordBreak: 'break-all' }} />
      ) : (
        t('pending')
      ),
    },
    {
      field: t(tx?.to_account?.smart_contract ? 'interactedContract' : 'to'),
      content: isTxLoading ? (
        <Skeleton animation="wave" />
      ) : tx ? (
        <HashLink label={toLabel} href={`/address/${toAddr}`} />
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
            <Tooltip title={tx.method_id} placement="top">
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
        <span className={styles.gasPrice}>{`${new BigNumber(tx.polyjuice.gas_price)
          .dividedBy(10 ** PCKB_UDT_INFO.decimal)
          .toFormat()} ${PCKB_UDT_INFO.symbol}`}</span>
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
            <Amount
              amount={`${new BigNumber(tx.polyjuice.gas_used).times(new BigNumber(tx.polyjuice.gas_price))}`}
              udt={PCKB_UDT_INFO}
              showSymbol
            />
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

  const title = t('txInfo')

  return (
    <>
      <SubpageHead subtitle={`${title} ${hash}`} />
      <div className={styles.container}>
        <PageTitle>
          <div className={styles.title}>
            {title}
            <DownloadMenu items={downloadItems} />
          </div>
        </PageTitle>

        <InfoList title={t(`overview`)} list={overview} style={{ marginBottom: '2rem' }} />

        <InfoList title={t(`basicInfo`)} list={basicInfo} style={{ marginBottom: '2rem' }} type="two-columns" />

        <div className={styles.list}>
          <Tabs
            value={tabs.indexOf(tab as string)}
            tabs={['erc20_records', 'logs', 'rawData'].map((label, idx) => ({
              label: t(label),
              href: `/tx/${hash}?tab=${tabs[idx]}`,
            }))}
          />
          {tab === 'erc20' ? (
            transferList || !isTransferListLoading ? (
              <TransferList token_transfers={transferList} />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === 'logs' ? (
            logsList || !isLogListLoading ? (
              <TxLogsList list={logsList} />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === 'raw-data' && tx ? <RawTxData hash={hash as string} /> : null}
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
