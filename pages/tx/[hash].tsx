import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useTranslation } from 'utils/i18n'

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
  const [t] = useTranslation('tx')
  return (
    <main>
      <div>
        {t('blockHash')}:{' '}
        <Link href={`/block/${blockHash}`}>
          <a>{blockHash}</a>
        </Link>
      </div>
      <div>
        {t('hash')}: {hash}
      </div>
      <div>
        {t('type')}: {type}
      </div>
      <div>
        {t('status')}: {status}
      </div>
      <div>
        {t('nonce')}: {nonce}
      </div>
      <div>
        {t('from')}:{' '}
        <Link href={`/account/${from}`}>
          <a>{from}</a>
        </Link>
      </div>
      <div>
        {t('to')}:{' '}
        <Link href={`/account/${to}`}>
          <a>{to}</a>
        </Link>
      </div>
      <div>
        {t('amount')}: {amount}
      </div>
      <div>
        {t('fee')}: {fee}
      </div>
      <div>
        {t('transferredAt')}: {transferedAt}
      </div>
      <div>
        {t('confirmedAt')}: {confirmedAt}
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
      transferedAt: Date.now().toString(),
      confirmedAt: Date.now().toString(),
    },
  }
}
export default Tx
