import { GetServerSideProps } from 'next'
import Link from 'next/link'

interface Tx {
  hash: string
  type: string
  from: string
  to: string
  amount: string
  fee: string
  createdAt: string
}

interface State {
  id: string
  nonce: string
  txList: Array<Tx>
}
const Account = ({ id, nonce, txList }: State) => {
  return (
    <main>
      <div>
        <div>Account Id: {id}</div>
        <div>Nonce: {nonce}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Tx Hash</th>
            <th>Type</th>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
            <th>Fee</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {txList.map(tx => (
            <tr key={tx.hash}>
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
              <td>{new Date(+tx.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps<State, { id: string }> = async context => {
  const { id } = context.params
  return {
    props: {
      id,
      nonce: `nonce-of-${id}`,
      txList: Array.from({ length: 10 }).map((_, idx) => ({
        hash: `tx-hash-${idx}`,
        type: `type-${idx}`,
        from: `from-${idx}`,
        to: `to-${idx}`,
        amount: `amount-${idx}`,
        fee: `fee-${idx}`,
        createdAt: Date.now().toString(),
      })),
    },
  }
}
export default Account
