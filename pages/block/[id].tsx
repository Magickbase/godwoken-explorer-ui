import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material'
import BigNumber from 'bignumber.js'
import Tabs from 'components/Tabs'
import SubpageHead from 'components/SubpageHead'
import InfoList from 'components/InfoList'
import TxList, { TxListProps, fetchTxList } from 'components/TxList'
import BridgedRecordList from 'components/BridgedRecordList'
import PageTitle from 'components/PageTitle'
import HashLink from 'components/HashLink'
import CopyBtn from 'components/CopyBtn'
import {
  fetchBlock,
  handleApiError,
  formatDatetime,
  useWS,
  getBlockRes,
  CKB_EXPLORER_URL,
  CHANNEL,
  formatInt,
  fetchBridgedRecordList,
  getBridgedRecordListRes,
  TabNotFoundException,
} from 'utils'
import styles from './styles.module.scss'

type RawBlock = Parameters<typeof getBlockRes>[0]
type ParsedBlock = ReturnType<typeof getBlockRes>
type ParsedBridgedRecordList = ReturnType<typeof getBridgedRecordListRes>

const tabs = ['transactions', 'bridged']

type State = ParsedBlock & Partial<{ txList: TxListProps['transactions']; bridgedRecordList: ParsedBridgedRecordList }>

const Block = (initState: State) => {
  const [block, setBlock] = useState(initState)
  const [t, { language }] = useTranslation('block')
  const {
    query: { tab = 'transactions' },
  } = useRouter()

  useEffect(() => {
    setBlock(initState)
  }, [setBlock, initState])

  useWS(
    `${CHANNEL.BLOCK_INFO}${block.number}`,
    (init: RawBlock) => {
      // setBlock(prev => ({ ...prev, ...getBlockRes(init) }))
    },
    (rawUpdate: RawBlock) => {
      const update = getBlockRes(rawUpdate)
      setBlock(prev => ({ ...prev, ...update }))
    },
    [setBlock, block.number],
  )

  const fields = [
    {
      label: 'hash',
      value: (
        <div className={styles.blockHash}>
          <span className="mono-font">{block.hash}</span>
          <CopyBtn content={block.hash} />
        </div>
      ),
    },
    {
      label: 'timestamp',
      value:
        block.timestamp > 0 ? (
          <time dateTime={new Date(block.timestamp).toISOString()} title={t('timestamp')}>
            {formatDatetime(block.timestamp)}
          </time>
        ) : (
          t('pending')
        ),
    },
    {
      label: 'layer1Info',
      value: block.layer1 ? (
        <div className={styles.layer1Info}>
          {language === 'zh-CN' ? (
            <>
              <div attr-role="block">
                区块
                <a href={`${CKB_EXPLORER_URL}/block/${block.layer1.block}`} target="_blank" rel="noopener noreferrer">
                  {formatInt(block.layer1.block)}
                  <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
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
                  <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
                </a>
              </div>
            </>
          )}
        </div>
      ) : (
        t('pending')
      ),
    },
    { label: 'finalizeState', value: <span className={styles.finalizeState}>{t(block.finalizeState)}</span> },
    { label: 'txCount', value: formatInt(block.txCount) },
    { label: 'aggregator', value: <span className={`${styles.aggregator} mono-font`}>{block.miner.hash}</span> },
    { label: 'size', value: new BigNumber(block.size || '0').toFormat() + ' bytes' },
    { label: 'gasUsed', value: new BigNumber(block.gas.used).toFormat() },
    { label: 'gasLimit', value: new BigNumber(block.gas.limit).toFormat() },
    {
      label: 'parentHash',
      value: (
        <HashLink label={block.parentHash} href={`/block/${block.parentHash}`} style={{ wordBreak: 'break-all' }} />
      ),
    },
  ]
  const title = `${t('block')} #${block.number}`
  return (
    <>
      <SubpageHead subtitle={title} />
      <div className={`main-center ${styles.container}`}>
        <PageTitle>{title}</PageTitle>
        <InfoList
          list={fields.map(field => ({ field: t(field.label), content: field.value }))}
          style={{ marginBottom: '2rem' }}
        />
        <div className={styles.list}>
          <Tabs
            value={tabs.indexOf(tab as string)}
            tabs={[t('transactionRecords'), t(`bridgedRecords`)].map((label, idx) => ({
              label,
              href: `/block/${block.hash}?tab=${tabs[idx]}`,
            }))}
          />
          {tab === 'transactions' && block.txList ? <TxList transactions={block.txList} /> : null}
          {tab === 'bridged' && block.bridgedRecordList ? (
            <BridgedRecordList list={block.bridgedRecordList} showUser />
          ) : null}
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ locale, res, params, query }) => {
  const { id } = params
  const { tab = tabs[0], before = null, after = null } = query
  try {
    if (typeof tab !== 'string' || !tabs.includes(tab)) {
      throw new TabNotFoundException()
    }

    const [block, lng] = await Promise.all([
      fetchBlock(id as string),
      serverSideTranslations(locale, ['common', 'block', 'list']),
    ])

    const txList =
      tab === 'transactions' && block.hash
        ? await fetchTxList({
            start_block_number: block.number,
            end_block_number: block.number,
            before: before as string | null,
            after: after as string | null,
          })
        : null

    const bridgedRecordList =
      tab === 'bridged' && block.hash
        ? await fetchBridgedRecordList({ block_number: block.number.toString(), page: query.page as string })
        : null

    return { props: { ...block, ...lng, txList, bridgedRecordList } }
  } catch (err) {
    return handleApiError(err, res, locale, id.toString())
  }
}

export default Block
