import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslation, timeDistance, fetchHome, API, handleApiError } from 'utils'

type State = API.Home.Parsed

const statisticFields = ['blockCount', 'txCount', 'tps', 'accountCount']
const blockFields = ['number', 'time', 'txCount']
const txFields = ['hash', 'time', 'from', 'to', 'action', 'success']

const BlockList = ({ list }: { list: State['blockList'] }) => {
  const [t, { language }] = useTranslation('block')
  return (
    <table className="basic-table col-span-2">
      <thead>
        <tr>
          {blockFields.map(field => (
            <th key={field}>{t(field)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {list.map(block => (
          <tr key={block.hash}>
            <td>
              <Link href={`/block/${block.hash}`}>
                <a>{block.number}</a>
              </Link>
            </td>
            <td>{timeDistance(block.timestamp, language)}</td>
            <td>{block.txCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const TxList = ({ list }: { list: State['txList'] }) => {
  const [t, { language }] = useTranslation('tx')
  return (
    <table className="basic-table col-span-2">
      <thead>
        <tr>
          {txFields.map(field => (
            <th key={field}>{t(field)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {list.map(tx => (
          <tr key={tx.hash}>
            <td>
              <Link href={`/tx/${tx.hash}`}>
                <a>{tx.hash}</a>
              </Link>
            </td>
            <td>{timeDistance(tx.timestamp, language)}</td>
            <td>
              <Link href={`/account/${tx.from}`}>
                <a>{tx.from}</a>
              </Link>
            </td>
            <td>
              <Link href={`/account/${tx.to}`}>
                <a>{tx.to}</a>
              </Link>
            </td>
            <td>{tx.action}</td>
            <td>{tx.success.toString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const Home = (initState: State) => {
  const [home, setHome] = useState(initState)
  const [t] = useTranslation('statistic')
  return (
    <div className="grid grid-cols-4 gap-5">
      {statisticFields.map(field => (
        <div key={field} className="whitespace-pre text-center capitalize">
          {t(field.toString(), { value: Number(home.statistic[field]).toLocaleString('en') })}
        </div>
      ))}
      <BlockList list={home.blockList} />
      <TxList list={home.txList} />
    </div>
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
