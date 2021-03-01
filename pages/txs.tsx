import { useState } from 'react'
import { GetServerSideProps } from 'next'
import { fetchTxList, API, handleApiError, useTranslation, ckbExplorerUrl, timeDistance } from 'utils'
import Link from 'next/link'

type State = { query: Record<string, string>; txList: API.Txs.Parsed }

const fields = ['hash', 'l2Block', 'age', 'from', 'to', 'action']
const List = ({ list }: { list: State['txList'] }) => {
  const [t, { language }] = useTranslation('tx')
  return (
    <table className="basic-table">
      <thead>
        <tr>
          {fields.map(field => (
            <th key={field}>{t(field)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {list.txs.map(tx => (
          <tr key={tx.hash}>
            <td>
              <Link href={`/tx/${tx.hash}`}>
                <a>{tx.hash}</a>
              </Link>
            </td>
            <td>
              <Link href={`/block/${tx.l2Block}`}>
                <a>{tx.l2Block}</a>
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
            <td>{tx.type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const TxList = (initState: State) => {
  const [{ query, txList }, setTxList] = useState(initState)
  const [t] = useTranslation('tx')
  return (
    <div>
      <h2 className="text-center font-bold mt-10 mb-5">{t('txListTitle', query)}</h2>
      <List list={txList} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ res, query }) => {
  try {
    const q = new URLSearchParams(query as Record<string, string>)
    const txList = await fetchTxList(`${q}`)
    return { props: { query: query as Record<string, string>, txList } }
  } catch (err) {
    return handleApiError(err, res)
  }
}

export default TxList
