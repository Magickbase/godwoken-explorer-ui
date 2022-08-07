import { useEffect, useState, useMemo } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useQuery } from 'react-query'
import { Skeleton } from '@mui/material'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
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
import { SIZES } from 'components/PageSize'
import PolyjuiceStatus from 'components/PolyjuiceStatus'
import ExpandIcon from 'assets/icons/expand.svg'
import {
  formatDatetime,
  fetchTx,
  useWS,
  getTxRes,
  fetchEventLogsListByType,
  handleApiError,
  CKB_EXPLORER_URL,
  CHANNEL,
  CKB_DECIMAL,
  GCKB_DECIMAL,
  PCKB_SYMBOL,
  NotFoundException,
} from 'utils'
import styles from './styles.module.scss'

type RawTx = Parameters<typeof getTxRes>[0]
type ParsedTx = ReturnType<typeof getTxRes>

const tabs = ['erc20', 'logs', 'raw-data']
type State = ParsedTx
const ADDR_LENGTH = 42

const Tx = (initState: State) => {
  const [tx, setTx] = useState(initState)
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
  } = useRouter()
  const [t] = useTranslation('tx')

  const downloadItems = [{ label: t('ERC20Records'), href: DOWNLOAD_HREF_LIST.txTransferList(tx.hash) }]

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
    () => fetchEventLogsListByType('txs', hash as string),
    {
      enabled: tab === 'logs',
    },
  )

  useEffect(() => {
    setTx(initState)
  }, [setTx, initState])

  useWS(
    `${CHANNEL.TX_INFO}${tx.hash}`,
    (init: RawTx) => {
      if (init) {
        setTx(prev => ({ ...getTxRes(init), gasUsed: prev.gasUsed, gasLimit: prev.gasLimit }))
      }
    },
    ({
      status = 'pending',
      l1_block_number,
      polyjuice_status,
    }: Partial<Pick<RawTx, 'status' | 'l1_block_number' | 'polyjuice_status'>>) => {
      setTx(prev => ({
        ...prev,
        status,
        l1BlockNumber: l1_block_number,
        polyjuiceStatus: polyjuice_status ?? prev.polyjuiceStatus,
      }))
    },
    [setTx, tx.hash],
  )

  const decodedInput = useMemo(() => {
    if (initState.contractAbi && initState.contractAbi.length && initState.input) {
      try {
        const i = new ethers.utils.Interface(initState.contractAbi)
        return i.parseTransaction({ data: initState.input })
      } catch (err) {
        console.error(err)
        return null
      }
    }
    return null
  }, [initState.contractAbi, initState.input])

  const utf8Input = useMemo(() => {
    if (initState.input) {
      try {
        return ethers.utils.toUtf8String(initState.input)
      } catch {
        return null
      }
    }
    return null
  }, [initState.input])

  const inputContents = [
    { type: 'raw', text: tx.input },
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

  const overview = [
    {
      field: t('hash'),
      content: (
        <div className={styles.hash}>
          <span className="mono-font">{tx.hash}</span>
          <CopyBtn content={tx.hash} />
        </div>
      ),
    },
    {
      field: t('from'),
      content: <HashLink label={tx.from} href={`/address/${tx.from}`} style={{ wordBreak: 'break-all' }} />,
    },
    {
      field: t(tx.toAlias ? 'interactedContract' : 'to'),
      content: <HashLink label={tx.toAlias || tx.to} href={`/address/${tx.to}`} />,
    },
    tx.contractAddress?.length === ADDR_LENGTH
      ? {
          field: t('deployed_contract'),
          content: <HashLink label={tx.contractAddress} href={`/address/${tx.contractAddress}`} />,
        }
      : null,
    {
      field: t('value'),
      // FIXME: tx.value is formatted incorrectly
      content: (
        <div className={styles.value}>{`${new BigNumber(tx.value || '0')
          .multipliedBy(CKB_DECIMAL)
          .dividedBy(GCKB_DECIMAL)
          .toFormat()} ${PCKB_SYMBOL}`}</div>
      ),
    },
    tx.input
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

  const basicInfo = [
    { field: t('finalizeState'), content: t(tx.status) },
    {
      field: t('type'),
      content: <TxType type={tx.type} />,
    },
    {
      field: t('l1Block'),
      content: tx.l1BlockNumber ? (
        <HashLink
          label={tx.l1BlockNumber.toLocaleString('en')}
          href={`${CKB_EXPLORER_URL}/block/${tx.l1BlockNumber}`}
          external
        />
      ) : (
        t('pending')
      ),
    },
    {
      field: t('l2Block'),
      content: tx.blockNumber ? (
        <HashLink label={tx.blockNumber.toLocaleString('en')} href={`/block/${tx.blockNumber}`} />
      ) : (
        t('pending')
      ),
    },
    { field: t('index'), content: tx.index ?? '-' },
    { field: t('nonce'), content: (tx.nonce || 0).toLocaleString('en') },
    {
      field: t('status'),
      content: <PolyjuiceStatus status={tx.polyjuiceStatus ?? null} />,
    },
    {
      field: t('gasPrice'),
      content:
        tx.gasPrice !== null ? (
          <span className={styles.gasPirce}>{`${new BigNumber(tx.gasPrice).toFormat()} ${PCKB_SYMBOL}`}</span>
        ) : (
          '-'
        ),
    },
    {
      field: t('gasUsed'),
      content: tx.gasUsed !== null ? new BigNumber(tx.gasUsed).toFormat() : '-',
    },
    {
      field: t('gasLimit'),
      content: tx.gasLimit !== null ? new BigNumber(tx.gasLimit).toFormat() : '-',
    },
    {
      field: t('fee'),
      content:
        tx.gasPrice !== null && typeof tx.gasUsed !== null ? (
          <span className={styles.gasFee}>{`${new BigNumber(tx.gasUsed)
            .times(new BigNumber(tx.gasPrice))
            .toFormat()} ${PCKB_SYMBOL}`}</span>
        ) : (
          '-'
        ),
    },
    {
      field: t('timestamp'),
      content:
        tx.timestamp >= 0 ? (
          <time dateTime={new Date(tx.timestamp).toISOString()}>{formatDatetime(tx.timestamp)}</time>
        ) : (
          t('pending')
        ),
    },
  ]

  const title = t('txInfo')

  return (
    <>
      <SubpageHead subtitle={`${title} ${tx.hash}`} />
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
              href: `/tx/${tx.hash}?tab=${tabs[idx]}`,
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
          {tab === 'raw-data' && tx ? <RawTxData hash={tx.hash} /> : null}
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: 'blocking',
})

export const getStaticProps: GetStaticProps<State, { hash: string }> = async ({ locale, params }) => {
  const { hash } = params

  try {
    const [tx, lng] = await Promise.all([fetchTx(hash), await serverSideTranslations(locale, ['common', 'tx', 'list'])])
    if (!tx?.hash) {
      throw new NotFoundException()
    }
    return { props: { ...tx, ...lng } }
  } catch (err) {
    return handleApiError(err, null, locale, hash)
  }
}
export default Tx
