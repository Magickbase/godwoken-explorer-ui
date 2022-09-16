import type { GetStaticPaths, GetStaticProps } from 'next'
import { useMemo, useState, useEffect } from 'react'
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
import Amount from 'components/Amount'
import { SIZES } from 'components/PageSize'
import PolyjuiceStatus from 'components/PolyjuiceStatus'
import ExpandIcon from 'assets/icons/expand.svg'
import { formatDatetime, fetchTx, fetchEventLogsListByType, CKB_EXPLORER_URL, PCKB_UDT_INFO, ZERO_ADDRESS } from 'utils'
import styles from './styles.module.scss'

const tabs = ['erc20', 'logs', 'raw-data']
const ADDR_LENGTH = 42

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

  const { isLoading: isTxLoading, data: tx } = useQuery(['tx', hash], () => fetchTx(hash as string), {
    enabled: !!hash,
    refetchInterval: isFinalized ? undefined : 10000,
  })

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
    if (tx?.status === 'finalized') {
      setIsFinalized(true)
    }
  }, [tx, setIsFinalized])

  if (!isTxLoading && !tx?.hash) {
    replace(`${language}/404?query=${hash}`)
  }

  const downloadItems = [{ label: t('ERC20Records'), href: DOWNLOAD_HREF_LIST.txTransferList(hash as string) }]

  const decodedInput = useMemo(() => {
    if (tx && tx.contractAbi && tx.contractAbi.length && tx.input) {
      try {
        const i = new ethers.utils.Interface(tx.contractAbi)
        return i.parseTransaction({ data: tx.input })
      } catch (err) {
        console.error(err)
        return null
      }
    }
    return null
  }, [tx?.contractAbi, tx?.input])

  const utf8Input = useMemo(() => {
    if (tx?.input) {
      try {
        return ethers.utils.toUtf8String(tx.input)
      } catch {
        return null
      }
    }
    return null
  }, [tx?.input])

  const inputContents = [
    { type: 'raw', text: tx?.input },
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
          <span className="mono-font">{hash as string}</span>
          <CopyBtn content={hash as string} field={t('transaction')} />
        </div>
      ),
    },
    {
      field: t('from'),
      content: isTxLoading ? (
        <Skeleton animation="wave" />
      ) : tx ? (
        <HashLink label={tx.from} href={`/address/${tx.from}`} style={{ wordBreak: 'break-all' }} />
      ) : (
        t('pending')
      ),
    },
    {
      field: t(tx?.toAlias ? 'interactedContract' : 'to'),
      content: isTxLoading ? (
        <Skeleton animation="wave" />
      ) : tx ? (
        <HashLink label={tx.toAlias || (tx.to === ZERO_ADDRESS ? 'zero address' : tx.to)} href={`/address/${tx.to}`} />
      ) : (
        t('pending')
      ),
    },
    tx?.contractAddress?.length === ADDR_LENGTH
      ? {
          field: t('deployed_contract'),
          content: <HashLink label={tx.contractAddress} href={`/address/${tx.contractAddress}`} />,
        }
      : null,
    {
      field: t('value'),
      // FIXME: tx.value is formatted incorrectly
      content: tx?.value ? (
        <div className={styles.value}>
          <Amount amount={tx?.value || '0'} udt={{ decimal: 10, symbol: PCKB_UDT_INFO.symbol }} showSymbol />
        </div>
      ) : (
        t('pending')
      ),
    },
    tx?.input
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

  const isPolyjuiceTx = tx?.type === 'polyjuice'

  const basicInfo = [
    { field: t('finalizeState'), content: tx ? t(tx.status) : <Skeleton animation="wave" /> },
    {
      field: t('type'),
      content: tx ? <TxType type={tx.type} /> : <Skeleton animation="wave" />,
    },
    {
      field: t('l1Block'),
      content: tx?.l1BlockNumber ? (
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
      content: tx?.blockNumber ? (
        <HashLink label={tx.blockNumber.toLocaleString('en')} href={`/block/${tx.blockNumber}`} />
      ) : (
        t('pending')
      ),
    },
    { field: t('index'), content: tx?.index ?? (isPolyjuiceTx ? t('pending') : '-') },
    { field: t('nonce'), content: tx ? (tx.nonce || 0).toLocaleString('en') : <Skeleton animation="wave" /> },
    {
      field: t('status'),
      content: tx ? <PolyjuiceStatus status={tx.polyjuiceStatus ?? null} /> : <Skeleton animation="wave" />,
    },
    {
      field: t('gasPrice'),
      content: tx?.gasPrice ? (
        <span className={styles.gasPrice}>{`${new BigNumber(tx.gasPrice).toFormat()} ${PCKB_UDT_INFO.symbol}`}</span>
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
        tx && tx.gasUsed ? (
          new BigNumber(tx.gasUsed).toFormat()
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
      content: tx?.gasLimit ? (
        new BigNumber(tx.gasLimit).toFormat()
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
        tx && tx.gasPrice && tx.gasUsed ? (
          <span className={styles.gasFee}>
            <Amount
              amount={`${new BigNumber(tx.gasUsed).times(new BigNumber(tx.gasPrice))}`}
              udt={{ decimal: 0, symbol: PCKB_UDT_INFO.symbol }}
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
      content:
        tx?.timestamp >= 0 ? (
          <time dateTime={new Date(tx.timestamp).toISOString()}>{formatDatetime(tx.timestamp)}</time>
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
