import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { timeDistance, fetchHome, API, handleApiError, imgUrl } from 'utils'

type State = API.Home.Parsed

const statisticGroups = [
  [
    { key: 'blockCount', icon: 'blocks' },
    { key: 'txCount', icon: 'txs' },
  ],
  [
    { key: 'tps', icon: 'dashboard', unit: 'tx/s' },
    { key: 'accountCount', icon: 'account' },
  ],
]

const SuccessIcon = <Image src={`${imgUrl}success.svg`} alt="success" width="15" height="15" layout="fixed" />
const FailureIcon = <Image src={`${imgUrl}failure.svg`} alt="success" width="15" height="15" layout="fixed" />

const Statistic = (statistic: State['statistic']) => {
  const [t] = useTranslation('statistic')

  return (
    <div className="statistic-container">
      {statisticGroups.map(group => (
        <div
          key={group.map(g => g.key).join()}
          className="flex w-full py-4 divide-x divide-white divide-opacity-20 md:w-1/2 md:flex-col md:divide-x-0 md:divide-y md:py-0 md:px-4 xl:divide-y-0 xl:divide-x xl:flex-row xl:px-0"
        >
          {group.map(field => (
            <div
              key={field.key}
              className="w-1/2 whitespace-pre capitalize text-sm even:pl-4 md:w-full md:even:pl-0 md:odd:pb-4 md:even:pt-4 xl:w-1/2 xl:odd:pb-0 xl:even:p-0 xl:odd:pl-4 xl:even:pl-4"
            >
              <div className="flex items-center leading-default">
                <Image
                  loading="lazy"
                  className="inverted-icon"
                  src={`${imgUrl}${field.icon}.svg`}
                  height="17"
                  width="17"
                  layout="fixed"
                  alt={t(field.key)}
                />
                <span className="ml-1">{t(field.key)}</span>
              </div>
              <span className="block text-xl font-bold overflow-hidden overflow-ellipsis pr-2">
                {Number(statistic[field.key]).toLocaleString('en')}
                {field.unit ? <span className="normal-case pl-1">{field.unit}</span> : undefined}
              </span>
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
    <div className="list-container z-10 my-4 md:w-1/2 md:mr-2">
      <h2 className="list-header">
        <Image
          loading="lazy"
          src={`${imgUrl}blocks.svg`}
          height="17"
          width="17"
          layout="fixed"
          alt={t('latestBlocks')}
        />
        <span>{t('latestBlocks')}</span>
      </h2>
      <div className="divide-y divide-light-grey">
        {list.map(block => (
          <div key={block.hash} className="list-item-container">
            <div className="flex justify-between mb-4 md:mb-3">
              <Link href={`/block/${block.hash}`}>
                <span className="overflow-hidden overflow-ellipsis">
                  #
                  <a title={t('number')} className="font-bold">
                    {Number(block.number).toLocaleString('en')}
                  </a>
                </span>
              </Link>
              <span className="text-right" title={t('txCount')}>
                {Number(block.txCount).toLocaleString('en')} TXs
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
    <div className="list-container z-10 my-4 md:w-1/2 md:ml-2">
      <h2 className="list-header">
        <Image loading="lazy" src={`${imgUrl}txs.svg`} height="17" width="17" layout="fixed" alt={t('latestBlocks')} />
        <span>{t('latestTxs')}</span>
      </h2>
      <div className="divide-y divide-light-grey">
        {list.map(tx => (
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

const Home = (initState: State) => {
  const [home, setHome] = useState(initState)
  return (
    <>
      <div className="home-bg"></div>
      <Statistic {...home.statistic} />
      <div className="md:flex">
        <BlockList list={home.blockList} />
        <TxList list={home.txList} />
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ res, locale }) => {
  try {
    const home = await fetchHome()
    const lng = await serverSideTranslations(locale, ['block', 'tx', 'statistic'])
    return { props: { ...home, ...lng } }
  } catch (err) {
    return handleApiError(err, res)
  }
}

export default Home
