import { FormEvent, useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { fetchTxList, API, useWS, getTxListRes, handleApiError, timeDistance, IMG_URL, PAGE_SIZE, CHANNEL } from 'utils'

type State = { query: Record<string, string>; txList: API.Txs.Parsed }

const SuccessIcon = <Image src={`${IMG_URL}success.svg`} alt="success" width="15" height="15" layout="fixed" />
const FailureIcon = <Image src={`${IMG_URL}failure.svg`} alt="success" width="15" height="15" layout="fixed" />

const getLink = (id: string, page: number) => `/txs?account_id=${id}&page=${page}`
const List = ({ list }: { list: State['txList'] }) => {
  const [t, { language }] = useTranslation('tx')
  return (
    <div className="list-container mt-2">
      <div className="divide-y divide-light-grey">
        {list.txs.map(tx => (
          <div key={tx.hash} className="list-item-container">
            <div className="flex items-center mb-3">
              <Link href={`/tx/${tx.hash}`}>
                <a title={t('hash')} className="hashLink flex-shrink">
                  {tx.hash}
                </a>
              </Link>
              <span className="tx-type-badge h-full mx-2" title={t('type')}>
                {tx.type}
              </span>
              <div style={{ width: 15, height: 15 }}>{tx.success ? SuccessIcon : FailureIcon}</div>
              <div className="flex justify-end items-center ml-auto pl-7">
                <Image src={`${IMG_URL}blocks.svg`} width="15" height="15" layout="fixed" loading="lazy" />
                <Link href={`/block/${tx.blockNumber}`}>
                  <a title={t('blockNumber')} className="ml-1">
                    {(+tx.blockNumber).toLocaleString('en')}
                  </a>
                </Link>
              </div>
            </div>
            <div className="flex items-center capitalize whitespace-nowrap">
              {t('from')}
              <Link href={`/account/${tx.from}`}>
                <a title={t('from')} className="ml-0.5 mr-1 overflow-hidden overflow-ellipsis" style={{ width: '30%' }}>
                  {tx.from}
                </a>
              </Link>
              <Image
                src={`${IMG_URL}arrow-down-rounded.svg`}
                width="14"
                height="14"
                className="transform -rotate-90 flex-shrink-0"
              />
              <span className="ml-1 mr-0.5">{t('to')}</span>
              <Link href={`/account/${tx.to}`}>
                <a title={t('to')} className="mx-0.5 overflow-hidden overflow-ellipsis" style={{ width: '30%' }}>
                  {tx.to}
                </a>
              </Link>
              <time
                dateTime={new Date(+tx.timestamp).toISOString()}
                className="flex flex-1 justify-end items-end list-datetime md:h-6 "
                title={t('timestamp')}
              >
                {timeDistance(tx.timestamp, language)}
              </time>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const TxList = (initState: State) => {
  const [
    {
      query: { account_id: id },
      txList,
    },
    setTxList,
  ] = useState(initState)
  const [t] = useTranslation('common')
  const [txT] = useTranslation('tx')
  const router = useRouter()

  useEffect(() => {
    setTxList(initState)
  }, [initState])

  useWS(
    `${CHANNEL.ACCOUNT_TX_LIST}${id}`,
    (init: API.Txs.Raw) => {
      setTxList(prev => (prev.txList.page === '1' ? { ...prev, txList: getTxListRes(init) } : prev))
    },
    (update: API.Txs.Raw) => {
      setTxList(prev => {
        const totalCount = `${+prev.txList.totalCount + +update.total_count}`
        const txs =
          prev.txList.page === '1'
            ? [...getTxListRes(update).txs, ...prev.txList.txs].slice(0, PAGE_SIZE)
            : prev.txList.txs
        return {
          ...prev,
          txList: {
            ...prev.txList,
            totalCount,
            txs,
          },
        }
      })
    },
    [setTxList, id],
  )

  const pageCount = Math.ceil(+txList.totalCount / PAGE_SIZE) || 1
  const handleGoTo = (e: FormEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const page: string = e.currentTarget['page']?.value
    if (!page) {
      return
    }
    router.push(getLink(id, +page))
  }
  return (
    <div>
      <h2 className="text-base leading-default font-bold mt-8 mb-2">
        {txT('txListTitle')}
        <Link href={`/account/${id}`}>
          <a className="ml-2 font-normal">{id}</a>
        </Link>
      </h2>
      {+txList.totalCount ? <List list={txList} /> : <span className="text-dark-grey">{txT('emptyTxList')}</span>}
      <div className="pager" attr-total-page={pageCount}>
        <div className="links" attr-disabled={`${+txList.page === 1}`}>
          <Link href={getLink(id, 1)}>
            <a title="first">
              <Image src={`${IMG_URL}page-first.svg`} width="14" height="14" loading="lazy" layout="fixed" />
            </a>
          </Link>
          <Link href={getLink(id, Math.max(+txList.page - 1, 1))}>
            <a title="previous">
              <Image src={`${IMG_URL}page-previous.svg`} width="14" height="14" loading="lazy" layout="fixed" />
            </a>
          </Link>
        </div>

        <form onSubmit={handleGoTo}>
          {t('page')}
          <input type="number" min="1" max={pageCount} id="page" placeholder={txList.page} />
          {`of ${pageCount}`}
          <button type="submit">{t('goTo')}</button>
        </form>

        <div className="links" attr-disabled={`${+txList.page === pageCount}`}>
          <Link href={getLink(id, Math.min(+txList.page + 1, pageCount))}>
            <a title="next">
              <Image src={`${IMG_URL}page-previous.svg`} width="14" height="14" loading="lazy" layout="fixed" />
            </a>
          </Link>
          <Link href={getLink(id, pageCount)}>
            <a title="last">
              <Image src={`${IMG_URL}page-first.svg`} width="14" height="14" loading="lazy" layout="fixed" />
            </a>
          </Link>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ locale, res, query }) => {
  try {
    const q = new URLSearchParams(query as Record<string, string>)
    const txList = await fetchTxList(`${q}`)
    const lng = await serverSideTranslations(locale, ['common', 'tx'])
    return { props: { query: query as Record<string, string>, txList, ...lng } }
  } catch (err) {
    return handleApiError(err, res)
  }
}

export default TxList
