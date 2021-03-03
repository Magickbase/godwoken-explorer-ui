import { FormEvent, useState } from 'react'
import { GetServerSideProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { fetchTxList, API, handleApiError, timeDistance, imgUrl, PAGE_SIZE } from 'utils'

type State = { query: Record<string, string>; txList: API.Txs.Parsed }

const SuccessIcon = <Image src={`${imgUrl}success.svg`} alt="success" width="15" height="15" layout="fixed" />
const FailureIcon = <Image src={`${imgUrl}failure.svg`} alt="success" width="15" height="15" layout="fixed" />

const getLink = (account: string, page: number) => `/txs?account=${account}&page=${page}`
const List = ({ list }: { list: State['txList'] }) => {
  const [t, { language }] = useTranslation('tx')
  return (
    <div className="list-container mt-2">
      <div className="divide-y divide-light-grey">
        {list.txs.map(tx => (
          <div key={tx.hash} className="list-item-container">
            <div className="flex items-center mb-3">
              <Link href={`/tx/${tx.hash}`}>
                <span>
                  #
                  <a title={t('hash')} className="font-bold">
                    {tx.hash}
                  </a>
                </span>
              </Link>
              <span className="tx-type-badge h-full mx-2" title={t('action')}>
                {tx.action}
              </span>
              {tx.success ? SuccessIcon : FailureIcon}
              <div className="flex justify-end items-center flex-1">
                <Image src={`${imgUrl}blocks.svg`} width="15" height="15" layout="fixed" loading="lazy" />
                <Link href={`/blocks/${tx.blockHash}`}>
                  <a className="ml-1">{tx.blockNumber}</a>
                </Link>
              </div>
            </div>
            <div className="flex items-center capitalize">
              {t('from')}
              <Link href={`/account/${tx.from}`}>
                <a title={t('from')} className="ml-0.5 mr-1">
                  {tx.from}
                </a>
              </Link>
              <Image src={`${imgUrl}arrow-down-rounded.svg`} width="14" height="14" className="transform -rotate-90" />
              <span className="ml-1 mr-0.5">{t('to')}</span>
              <Link href={`/account/${tx.to}`}>
                <a title={t('to')} className="mx-0.5">
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
  const [{ query, txList }, setTxList] = useState(initState)
  const [t] = useTranslation('common')
  const [txT] = useTranslation('tx')
  const router = useRouter()

  const pageCount = Math.ceil(+txList.totalCount / PAGE_SIZE)
  const handleGoTo = (e: FormEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const page = +e.currentTarget['page']?.value
    if (Number.isNaN(page) || page > pageCount) {
      return
    }
    router.push(getLink(query.account, page))
  }
  return (
    <div>
      <h2 className="text-base leading-default font-bold mt-8 mb-2">
        {txT('txListTitle')}
        <Link href={`/account/${query.account}`}>
          <a className="ml-2 font-normal">{query.account}</a>
        </Link>
      </h2>
      <List list={txList} />
      <div className="pager">
        <div className="links" attr-disable={`${+txList.page === 1}`}>
          <Link href={getLink(query.account, 1)}>
            <a title="first">
              <Image src={`${imgUrl}page-first.svg`} width="14" height="14" loading="lazy" layout="fixed" />
            </a>
          </Link>
          <Link href={getLink(query.account, Math.max(+txList.page - 1, 1))}>
            <a title="previous">
              <Image src={`${imgUrl}page-previous.svg`} width="14" height="14" loading="lazy" layout="fixed" />
            </a>
          </Link>
        </div>

        <form onSubmit={handleGoTo}>
          {t('page')}
          <input id="page" placeholder={txList.page} />
          {`of ${pageCount}`}
          <button type="submit">{t('goTo')}</button>
        </form>

        <div className="links" attr-disable={`${+txList.page === pageCount}`}>
          <Link href={getLink(query.account, Math.min(+txList.page + 1, pageCount))}>
            <a title="next">
              <Image src={`${imgUrl}page-previous.svg`} width="14" height="14" loading="lazy" layout="fixed" />
            </a>
          </Link>
          <Link href={getLink(query.account, pageCount)}>
            <a title="last">
              <Image src={`${imgUrl}page-first.svg`} width="14" height="14" loading="lazy" layout="fixed" />
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
