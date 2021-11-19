import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { timeDistance, fetchHome, API, handleApiError, IMG_URL, useWS, CHANNEL, getHomeRes } from 'utils'

type State = API.Home.Parsed

const formatAddress = (addr: string) => {
  if (addr.length > 13) {
    return `${addr.substr(0, 7)}...${addr.slice(-5)}`
  }
  return addr
}

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

const SuccessIcon = <Image src={`${IMG_URL}success.svg`} alt="success" width="15" height="15" layout="fixed" />
const FailureIcon = <Image src={`${IMG_URL}failure.svg`} alt="failure" width="15" height="15" layout="fixed" />

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
              <div className="flex items-center leading-default" aria-label={t(field.key)}>
                <Image
                  loading="lazy"
                  className="inverted-icon"
                  src={`${IMG_URL}${field.icon}.svg`}
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
    <div className="list-container z-10 my-4 lg:w-1/2 lg:mr-2" aria-label="">
      <h2 className="list-header" aria-label={t('latestBlocks')}>
        <Image
          loading="lazy"
          src={`${IMG_URL}blocks.svg`}
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
            <div className="flex justify-between mb-4 lg:mb-3">
              <Link href={`/block/${block.hash}`}>
                <a title={t('number')} className="hashLink flex-1">
                  {BigInt(block.number).toLocaleString('en')}
                </a>
              </Link>
              <span className="text-right" title={t('txCount')}>
                {BigInt(block.txCount).toLocaleString('en')} TXs
              </span>
            </div>
            <time
              dateTime={new Date(+block.timestamp).toISOString()}
              className="flex justify-end list-datetime lg:h-6"
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
    <div className="list-container z-10 my-4 lg:w-1/2 lg:ml-2">
      <h2 className="list-header" aria-label={t('latestTxs')}>
        <Image loading="lazy" src={`${IMG_URL}txs.svg`} height="17" width="17" layout="fixed" alt={t('latestBlocks')} />
        <span>{t('latestTxs')}</span>
      </h2>
      <div className="divide-y divide-light-grey">
        {list.map(tx => (
          <div key={tx.hash} className="list-item-container">
            <div className="flex items-center mb-3">
              <Link href={`/tx/${tx.hash}`}>
                <a title={t('hash')} className="hashLink flex-1">
                  {tx.hash}
                </a>
              </Link>
              <span className="tx-type-badge h-full mx-2" title={t('type')}>
                {tx.type}
              </span>
              {tx.success ? SuccessIcon : FailureIcon}
            </div>
            <div className="text-xs sm:text-sm flex flex-wrap justify-between items-center whitespace-nowrap">
              <div className="flex-1 flex items-center sm:justify-between mr-8">
                <div>
                  {t('from')}
                  <Link href={`/account/${tx.from}`}>
                    <a title={t('from')} className="ml-0.5 mr-1 select-none" data-addr={tx.from}>
                      {formatAddress(tx.from)}
                    </a>
                  </Link>
                </div>
                <Image
                  src={`${IMG_URL}arrow-down-rounded.svg`}
                  width="14"
                  height="14"
                  className="transform -rotate-90 flex-shrink-0"
                />
                <div>
                  <span className="ml-1 mr-0.5">{t('to')}</span>
                  <Link href={`/account/${tx.to}`}>
                    <a title={t('to')} className="mx-0.5 select-none" data-addr={tx.to}>
                      {formatAddress(tx.to)}
                    </a>
                  </Link>
                </div>
              </div>
              <time
                dateTime={new Date(+tx.timestamp).toISOString()}
                className="flex justify-end items-center list-datetime ml-auto lg:h-6"
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

  useWS(
    CHANNEL.HOME,
    (init: API.Home.Raw) => setHome(getHomeRes(init)),
    (update: API.Home.Raw) => {
      const { blockList, statistic, txList } = getHomeRes(update)
      const MAX_COUNT = 10
      setHome(state => ({
        statistic,
        blockList: [...blockList, ...state.blockList].sort((b1, b2) => b2.timestamp - b1.timestamp).slice(0, MAX_COUNT),
        txList: [...txList, ...state.txList].sort((t1, t2) => t2.timestamp - t1.timestamp).slice(0, MAX_COUNT),
      }))
    },
    [setHome],
  )

  return (
    <>
      <div className="home-bg"></div>
      <Statistic {...home.statistic} />
      <div className="lg:flex">
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
