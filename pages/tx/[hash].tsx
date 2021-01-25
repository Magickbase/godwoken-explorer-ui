import { GetServerSideProps } from 'next'
import Link from 'next/link'

interface State {
  hash: string
  blockHash: string
  type: string
  status: string
  nonce: string
  from: string
  to: string
  amount: string
  fee: string
  transferedAt: string
  confirmedAt: string
}
const Tx = ({ hash, blockHash, type, nonce, amount, fee, from, to, transferedAt, confirmedAt, status }: State) => {
  return (
    <main>
      <div>
        Block Hash:{' '}
        <Link href={`/block/${blockHash}`}>
          <a>{blockHash}</a>
        </Link>
      </div>
      <div>Tx Hash: {hash}</div>
      <div>Type: {type}</div>
      <div>Status: {status}</div>
      <div>Nonce: {nonce}</div>
      <div>
        From:{' '}
        <Link href={`/account/${from}`}>
          <a>{from}</a>
        </Link>
      </div>
      <div>
        To:{' '}
        <Link href={`/account/${to}`}>
          <a>{to}</a>
        </Link>
      </div>
      <div>Amount: {amount}</div>
      <div>Fee: {fee}</div>
      <div>Transfered At: {transferedAt}</div>
      <div>Confirmed At: {confirmedAt}</div>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps<State, { hash: string }> = async context => {
  const { hash } = context.params
  return {
    props: {
      hash,
      blockHash: `block-hash-of-${hash}`,
      type: `type-of-${hash}`,
      status: `status-of-${hash}`,
      nonce: `nonce-of-${hash}`,
      from: `from-of-${hash}`,
      to: `to-of-${hash}`,
      amount: `amount-of-${hash}`,
      fee: `fee-of-${hash}`,
      transferedAt: Date.now().toString(),
      confirmedAt: Date.now().toString(),
    },
  }
}
export default Tx
