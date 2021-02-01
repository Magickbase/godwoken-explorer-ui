import { GetServerSideProps } from 'next'
import Link from 'next/link'
import TxList from 'components/TxList'
import { useTranslation, formatDatetime } from 'utils'

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
  hash: string
  rootHash: string
  commitTxHash: string
  commitedAt: string
  txList: Array<Tx>
}

const Block = ({ hash, rootHash, commitTxHash, commitedAt, txList }: State) => {
  const [t] = useTranslation('block')
  const infoList = [
    {
      label: 'hash',
      value: hash,
    },
    {
      label: 'rootHash',
      value: rootHash,
    },
    {
      label: 'commitTxHash',
      value: (
        <Link href={`/tx/${commitTxHash}`}>
          <a>{commitTxHash}</a>
        </Link>
      ),
    },
    {
      label: 'committedAt',
      value: formatDatetime(+commitedAt),
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
      <TxList list={txList} />
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { hash } = context.params
  return {
    props: {
      hash,
      number: `block-number-of-${hash}`,
      commitTxHash: `commit-tx-hash-of-${hash}`,
      commitedAt: Date.now().toString(),
      txList: Array.from({ length: 10 }).map((_, idx) => ({
        hash: `hash-${idx}`,
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

export default Block
