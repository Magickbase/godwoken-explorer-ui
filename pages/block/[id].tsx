import type { GetStaticProps, GetStaticPaths } from 'next'
import { useEffect, useState } from 'react'
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
import DownloadMenu, { DOWNLOAD_HREF_LIST } from 'components/DownloadMenu'
import ResponsiveHash from 'components/ResponsiveHash'
import OpenInNewIcon from 'assets/icons/open-in-new.svg'
import { fetchBlock, formatDatetime, CKB_EXPLORER_URL, formatInt, fetchBridgedRecordList, isEthAddress } from 'utils'
import styles from './styles.module.scss'

const tabs = ['transactions', 'bridged', 'raw-data']

const Block = () => {
  const [t, { language }] = useTranslation('block')
  const [isFinalized, setIsFinalized] = useState(false)
  const {
    replace,
    query: {
      id,
      tab = 'transactions',
      before = null,
      after = null,
      page = '1',
      address_from = null,
      address_to = null,
      age_range_start = null,
      age_range_end = null,
      method_id = null,
      method_name = null,
    },
  } = useRouter()

  const { isLoading: isBlockLoading, data: block } = useQuery(['block', id], () => fetchBlock(id as string), {
    refetchInterval: isFinalized ? undefined : 10000,
  })

  useEffect(() => {
    if (!isBlockLoading && !block?.hash) {
      replace(`/${language}/404?query=${id}`)
    }
    if (block && block.finalizeState === 'finalized') {
      setIsFinalized(true)
    }
  }, [isBlockLoading, block, replace, setIsFinalized])

  const { isLoading: isTxListLoading, data: txList } = useQuery(
    [
      'block-tx-list',
      block?.number,
      before,
      after,
      address_from,
      address_to,
      age_range_start,
      age_range_end,
      method_id,
      method_name,
    ],
    () =>
      fetchTxList({
        start_block_number: block?.number,
        end_block_number: block?.number,
        before: before as string | null,
        after: after as string | null,
        address_from: isEthAddress(address_from as string) ? (address_from as string) : null,
        address_to: isEthAddress(address_to as string) ? (address_to as string) : null,
        from_script_hash: !isEthAddress(address_from as string) ? (address_from as string) : null,
        to_script_hash: !isEthAddress(address_to as string) ? (address_to as string) : null,
        age_range_start: age_range_start as string | null,
        age_range_end: age_range_end as string | null,
        method_id: method_id as string | null,
        method_name: method_name as string | null,
        combine_from_to: address_from && address_to ? false : true,
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
        <ResponsiveHash label={block.hash} btnRight="copy" copyAlertText={t('block-hash', { ns: 'common' })} />
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
                <ResponsiveHash
                  label={block.layer1.txHash}
                  href={`${CKB_EXPLORER_URL}/transaction/${block.layer1.txHash}`}
                  btnRight="openInNew"
                  isExternalLink
                />
              </div>
            </>
          ) : (
            <>
              <div attr-role="tx">
                Transaction
                <ResponsiveHash
                  label={block.layer1.txHash}
                  href={`${CKB_EXPLORER_URL}/transaction/${block.layer1.txHash}`}
                  btnRight="openInNew"
                  isExternalLink
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
      value: block ? <ResponsiveHash label={block.miner.hash} /> : <Skeleton animation="wave" width="66ch" />,
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
        <ResponsiveHash label={block.parentHash} href={`/block/${block.parentHash}`} />
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
              <TxList transactions={txList} blockNumber={block.number} />
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
