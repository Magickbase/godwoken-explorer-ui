import type { GetStaticProps, GetStaticPaths } from 'next'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useQuery } from 'react-query'
import { Skeleton } from '@mui/material'
import BigNumber from 'bignumber.js'
import Tabs from 'components/Tabs'
import SubpageHead from 'components/SubpageHead'
import InfoList from 'components/InfoList'
import TxList, { fetchTxList } from 'components/TxList'
import BridgedRecordList from 'components/BridgedRecordList'
import RawBlockData from 'components/RawBlockData'
import PageTitle from 'components/PageTitle'
import HashLink from 'components/HashLink'
import CopyBtn from 'components/CopyBtn'
import OpenInNewIcon from 'assets/icons/open-in-new.svg'
import DownloadMenu, { DOWNLOAD_HREF_LIST } from 'components/DownloadMenu'
import { fetchBlock, formatDatetime, CKB_EXPLORER_URL, formatInt, fetchBridgedRecordList } from 'utils'
import styles from './styles.module.scss'

const tabs = ['transactions', 'bridged', 'raw-data']

const Block = () => {
  const [t, { language }] = useTranslation('block')
  const {
    replace,
    query: { id, tab = 'transactions', before = null, after = null, page = '1' },
  } = useRouter()

  const { isLoading: isBlockLoading, data: block } = useQuery(['block', id], () => fetchBlock(id as string), {
    refetchInterval: 10000,
  })

  useEffect(() => {
    if (!isBlockLoading && !block?.hash) {
      replace(`/${language}/404?query=${id}`)
    }
  }, [isBlockLoading, block, replace])

  const { isLoading: isTxListLoading, data: txList } = useQuery(
    ['block-tx-list', block?.number, before, after],
    () =>
      fetchTxList({
        start_block_number: block?.number,
        end_block_number: block?.number,
        before: before as string | null,
        after: after as string | null,
      }),
    {
      enabled: tab === 'transactions' && !!block?.hash,
    },
  )

  const { isLoading: isBridgeListLoading, data: bridgedRecordList } = useQuery(
    ['block-bridge-list', block?.number, page],
    () => fetchBridgedRecordList({ block_number: block?.number.toString(), page: page as string }),
    {
      enabled: tab === 'bridged' && !!block?.hash,
    },
  )

  const downloadItems = block?.hash
    ? [
        { label: t('transactionRecords'), href: DOWNLOAD_HREF_LIST.blockTxList(block.hash) },
        { label: t('bridgedRecords'), href: DOWNLOAD_HREF_LIST.blockBridgeRecordList(block.number.toString()) },
      ]
    : []

  const fields = [
    {
      label: 'hash',
      value: block ? (
        <div className={styles.blockHash}>
          <span className="mono-font">{block.hash}</span>
          <CopyBtn content={block.hash} />
        </div>
      ) : (
        <Skeleton animation="wave" width="66ch" />
      ),
    },
    {
      label: 'timestamp',
      value: !block ? (
        <Skeleton animation="wave" width="66ch" />
      ) : block.timestamp > 0 ? (
        <time dateTime={new Date(block.timestamp).toISOString()} title={t('timestamp')}>
          {formatDatetime(block.timestamp)}
        </time>
      ) : (
        t('pending')
      ),
    },
    {
      label: 'layer1Info',
      value: !block ? (
        <Skeleton animation="wave" width="66ch" />
      ) : block.layer1 ? (
        <div className={styles.layer1Info}>
          {language === 'zh-CN' ? (
            <>
              <div attr-role="block">
                区块
                <a href={`${CKB_EXPLORER_URL}/block/${block.layer1.block}`} target="_blank" rel="noopener noreferrer">
                  {formatInt(block.layer1.block)}
                  <OpenInNewIcon style={{ marginLeft: 8 }} />
                </a>
                中的
              </div>
              <hr attr-role="divider" />
              <div attr-role="tx">
                交易
                <HashLink
                  label={block.layer1.txHash}
                  href={`${CKB_EXPLORER_URL}/transaction/${block.layer1.txHash}`}
                  external
                />
              </div>
            </>
          ) : (
            <>
              <div attr-role="tx">
                Transaction
                <HashLink
                  label={block.layer1.txHash}
                  href={`${CKB_EXPLORER_URL}/transaction/${block.layer1.txHash}`}
                  external
                />
              </div>
              <hr attr-role="divider" />
              <div attr-role="block">
                in block
                <a href={`${CKB_EXPLORER_URL}/block/${block.layer1.block}`} target="_blank" rel="noopener noreferrer">
                  {formatInt(block.layer1.block)}
                  <OpenInNewIcon style={{ marginLeft: 8 }} />
                </a>
              </div>
            </>
          )}
        </div>
      ) : (
        t('pending')
      ),
    },
    {
      label: 'finalizeState',
      value: block ? (
        <span className={styles.finalizeState}>{t(block.finalizeState)}</span>
      ) : (
        <Skeleton animation="wave" width="66ch" />
      ),
    },
    { label: 'txCount', value: block ? formatInt(block.txCount) : <Skeleton animation="wave" width="66ch" /> },
    {
      label: 'aggregator',
      value: block ? (
        <span className={`${styles.aggregator} mono-font`}>{block.miner.hash}</span>
      ) : (
        <Skeleton animation="wave" width="66ch" />
      ),
    },
    {
      label: 'size',
      value: block ? (
        new BigNumber(block.size || '0').toFormat() + ' bytes'
      ) : (
        <Skeleton animation="wave" width="66ch" />
      ),
    },
    {
      label: 'gasUsed',
      value: block ? new BigNumber(block.gas.used).toFormat() : <Skeleton animation="wave" width="66ch" />,
    },
    {
      label: 'gasLimit',
      value: block ? new BigNumber(block.gas.limit).toFormat() : <Skeleton animation="wave" width="66ch" />,
    },
    {
      label: 'parentHash',
      value: block ? (
        <HashLink label={block.parentHash} href={`/block/${block.parentHash}`} style={{ wordBreak: 'break-all' }} />
      ) : (
        <Skeleton animation="wave" width="66ch" />
      ),
    },
  ]

  const title = `${t('block')} # ${block ? formatInt(block.number) : ''}`

  return (
    <>
      <SubpageHead subtitle={title} />
      <div className={styles.container}>
        <PageTitle>
          <div className={styles.title}>
            {title}
            <DownloadMenu items={downloadItems} />{' '}
          </div>
        </PageTitle>
        <InfoList
          list={fields.map(field => ({ field: t(field.label), content: field.value }))}
          style={{ marginBottom: '2rem' }}
        />
        <div className={styles.list}>
          <Tabs
            value={tabs.indexOf(tab as string)}
            tabs={[t('transactionRecords'), t(`bridgedRecords`), t(`rawData`)].map((label, idx) => ({
              label,
              href: block ? `/block/${block.hash}?tab=${tabs[idx]}` : null,
            }))}
          />
          {tab === 'transactions' ? (
            !isTxListLoading && txList ? (
              <TxList transactions={txList} />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === 'bridged' ? (
            !isBridgeListLoading && bridgedRecordList ? (
              <BridgedRecordList list={bridgedRecordList} showUser />
            ) : (
              <Skeleton animation="wave" />
            )
          ) : null}
          {tab === 'raw-data' && block ? <RawBlockData no={block.number} /> : null}
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
  const lng = await serverSideTranslations(locale, ['common', 'block', 'list'])
  return { props: lng }
}

export default Block
