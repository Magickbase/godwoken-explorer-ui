import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useTranslation, formatDatetime } from 'utils'

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
  transferredAt: string
  confirmedAt: string
}
const Tx = ({ hash, blockHash, type, nonce, amount, fee, from, to, transferredAt, confirmedAt, status }: State) => {
  const [t] = useTranslation('tx')
  const infoList = [
    {
      label: 'blockHash',
      value: (
        <Link href={`/block/${blockHash}`}>
          <a>{blockHash}</a>
        </Link>
      ),
    },
    {
      label: 'hash',
      value: hash,
    },
    {
      label: 'type',
      value: type,
    },
    {
      label: 'status',
      value: status,
    },
    {
      label: 'nonce',
      value: nonce,
    },
    {
      label: 'from',
      value: (
        <Link href={`/account/${from}`}>
          <a>{from}</a>
        </Link>
      ),
    },
    {
      label: 'to',
      value: (
        <Link href={`/account/${to}`}>
          <a>{to}</a>
        </Link>
      ),
    },
    {
      label: 'amount',
      value: amount,
    },
    {
      label: 'fee',
      value: fee,
    },
    {
      label: 'transferredAt',
      value: formatDatetime(+transferredAt),
    },
    {
      label: 'confirmedAt',
      value: formatDatetime(+confirmedAt),
    },
  ]
  return (
    <main>
      <div className="basic-info-list">
        {infoList.map(info => (
          <div key={info.label}>
            <span>{t(info.label)}</span>
            <div>{info.value}</div>
          </div>
        ))}
      </div>
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
      transferredAt: Date.now().toString(),
      confirmedAt: Date.now().toString(),
    },
  }
}
export default Tx
