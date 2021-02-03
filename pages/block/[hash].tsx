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

export const getServerSideProps: GetServerSideProps = async ({ res, params }) => {
  const { hash } = params
  const blockRes = await fetch(`${process.env.SERVER_URL}blocks/${hash}`)
  if (blockRes.status === 404) {
    res.setHeader('location', '/404')
    res.statusCode = 302
    res.end()
    return
  }

  const block = await blockRes.json()
  return {
    props: {
      ...block,
      commitedAt: Date.now().toString(),
      txList: block.txList.map(tx => ({
        ...tx,
        createdAt: Date.now().toString(),
      })),
    },
  }
}

export default Block
