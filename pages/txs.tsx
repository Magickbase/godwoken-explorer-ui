import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { fetchTxList, API, handleApiError, timeDistance, imgUrl } from 'utils'

type State = { query: Record<string, string>; txList: API.Txs.Parsed }

const SuccessIcon = <Image src={`${imgUrl}success.svg`} alt="success" width="15" height="15" layout="fixed" />
const FailureIcon = <Image src={`${imgUrl}failure.svg`} alt="success" width="15" height="15" layout="fixed" />

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
  const [t] = useTranslation('tx')
  return (
    <div>
      <h2 className="text-base leading-default font-bold mt-8 mb-2">
        {t('txListTitle')}
        <Link href={`/account/${query.account}`}>
          <a className="ml-2 font-normal">{query.account}</a>
        </Link>
      </h2>
      <List list={txList} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ locale, res, query }) => {
  try {
    const q = new URLSearchParams(query as Record<string, string>)
    const txList = await fetchTxList(`${q}`)
    const lng = await serverSideTranslations(locale, ['tx'])
    return { props: { query: query as Record<string, string>, txList, ...lng } }
  } catch (err) {
    return handleApiError(err, res)
  }
}

export default TxList
