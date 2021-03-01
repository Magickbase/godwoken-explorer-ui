import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import Search from 'components/Search'
import { useTranslation, timeDistance, fetchHome, API, handleApiError } from 'utils'

type State = API.Home.Parsed

const statisticGroups = [
  ['blockCount', 'txCount'],
  ['tps', 'accountCount'],
]

const Statistic = (statistic: State['statistic']) => {
  const [t] = useTranslation('statistic')

  return (
    <div className="flex flex-wrap w-full px-4 rounded-md bg-gradient-to-r from-secondary to-primary text-white divide-y divide-white divide-opacity-20 md:divide-y-0 md:divide-x md:px-0 md:py-4">
      {statisticGroups.map(group => (
        <div
          key={group.join()}
          className="flex w-full py-4 divide-x divide-white divide-opacity-20 md:w-1/2 md:flex-col md:divide-x-0 md:divide-y md:py-0 md:px-4 xl:divide-y-0 xl:divide-x xl:flex-row xl:px-0"
        >
          {group.map(field => (
            <div
              key={field}
              className="flex-1 whitespace-pre capitalize even:pl-4 md:even:pl-0 md:odd:pb-4 md:even:pt-4 xl:odd:pb-0 xl:even:p-0 xl:odd:pl-4 xl:even:pl-4"
            >
              {t(field.toString(), { value: Number(statistic[field]).toLocaleString('en') })}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

const BlockList = ({ list }: { list: State['blockList'] }) => {
  const [t, { language }] = useTranslation('block')
  return (
    <div className="list-container my-4 md:flex-1 md:mr-2">
      <h2 className="border-b px-4 py-2 list-header">{t('latestBlocks')}</h2>
      <div className="divide-y">
        {list.map(block => (
          <div key={block.hash} className="px-4 py-5">
            <div className="flex justify-between mb-4 md:mb-3">
              <Link href={`/block/${block.hash}`}>
                <span>
                  #<a title={t('number')}>{block.number}</a>
                </span>
              </Link>
              <span className="text-right" title={t('txCount')}>
                {block.txCount} TXs
              </span>
            </div>
            <time
              dateTime={new Date(+block.timestamp).toISOString()}
              className="flex justify-end list-datetime md:h-6"
              title={t('timestamp')}
            >
              {timeDistance(block.timestamp, language)}
            </time>
          </div>
        ))}
      </div>
    </div>
  )
}

const TxList = ({ list }: { list: State['txList'] }) => {
  const [t, { language }] = useTranslation('tx')
  return (
    <div className="list-container my-4 md:flex-1 md:ml-2">
      <h2 className="border-b px-4 py-2 list-header">{t('latestTxs')}</h2>
      <div className="divide-y">
        {list.map(tx => (
          <div key={tx.hash} className="px-4 py-5">
            <div className="flex items-center mb-3">
              <Link href={`/tx/${tx.hash}`}>
                <span>
                  #<a title={t('hash')}>{tx.hash}</a>
                </span>
              </Link>
              <span className="tx-type-badge mx-2" title={t('action')}>
                {tx.action}
              </span>
              <span title={t('success')}>{tx.success.toString()}</span>
            </div>
            <div className="flex">
              {t('from')}
              <Link href={`/account/${tx.from}`}>
                <a title={t('from')}>{tx.from}</a>
              </Link>
              {'>>>'}
              {t('to')}
              <Link href={`/account/${tx.to}`}>
                <a title={t('to')}>{tx.to}</a>
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

const Home = (initState: State) => {
  const [home, setHome] = useState(initState)
  return (
    <>
      <div className="py-8">
        <Search />
      </div>

      <Statistic {...home.statistic} />
      <div className="md:flex">
        <BlockList list={home.blockList} />
        <TxList list={home.txList} />
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ res }) => {
  try {
    const home = await fetchHome()
    return { props: home }
  } catch (err) {
    return handleApiError(err, res)
  }
}

export default Home
