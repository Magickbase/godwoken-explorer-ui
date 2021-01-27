import { GetServerSideProps } from 'next'
import Link from 'next/link'
import TxList from 'components/TxList'
import { useTranslation } from 'utils/i18n'

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
  return (
    <main>
      <div>
        <div>
          {t('hash')}: {hash}
        </div>
        <div>
          {t('rootHash')}: {rootHash}
        </div>
        <div>
          {t('commitTxHash')}:{' '}
          <Link href={`/tx/${commitTxHash}`}>
            <a>{commitTxHash}</a>
          </Link>
        </div>
        <div>
          {t('committedAt')}: {new Date(+commitedAt).toLocaleDateString()}
        </div>
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
