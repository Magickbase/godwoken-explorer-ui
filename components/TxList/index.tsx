import Link from 'next/link'
import { useTranslation, formatDatetime } from 'utils'

export interface Tx {
  hash: string
  type: string
  from: string
  to: string
  amount: string
  fee: string
  createdAt: string
}

export interface TxListProps {
  list: Array<Tx>
}

const Tx = ({ tx }: { tx: Tx }) => (
  <tr>
    <td>
      <Link href={`/tx/${tx.hash}`}>
        <a>{tx.hash}</a>
      </Link>
    </td>
    <td>{tx.type}</td>
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
    <td>{tx.amount}</td>
    <td>{tx.fee}</td>
    <td>{formatDatetime(+tx.createdAt)}</td>
  </tr>
)
const fields = ['hash', 'type', 'from', 'to', 'amount', 'fee', 'createdAt']

const TxList = ({ list }: TxListProps) => {
  const [t] = useTranslation('tx')
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
        {list.map(tx => (
          <Tx tx={tx} key={tx.hash} />
        ))}
      </tbody>
    </table>
  )
}

export default TxList
