import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useTranslation, formatDatetime, fetchTx, API, handleApiError, ckbExplorerUrl } from 'utils'
import CardFieldsetList from 'components/CardFieldsetList'
type State = API.Tx.Parsed

const Tx = (initState: State) => {
  const [tx, setTx] = useState(initState)
  const [t] = useTranslation('tx')
  const fieldsetList = [
    [
      { label: 'timestamp', value: formatDatetime(+tx.timestamp) },
      {
        label: 'l2Block',
        value: (
          <Link href={`/block/${tx.l2Block}`}>
            <a title={t('l2Block')}>{tx.l2Block}</a>
          </Link>
        ),
      },
      {
        label: 'l1Block',
        value: (
          <Link href={`${ckbExplorerUrl}/block/${tx.l1Block}`}>
            <a title={t('l1Block')}>{tx.l1Block}</a>
          </Link>
        ),
      },
      {
        label: 'type',
        value: (
          <span className="tx-type-badge" title={t('type')}>
            {tx.type}
          </span>
        ),
      },
      { label: 'finalizeState', value: <span title={t('finalizeState')}>{tx.finalizeState}</span> },
    ],
    [
      { label: 'nonce', value: <span title={t('nonce')}>{tx.nonce}</span> },
      { label: 'args', value: <span title={t('args')}>{tx.args}</span> },
      { label: 'gasPrice', value: <span title={t('gasPrice')}>{tx.gasPrice}</span> },
      { label: 'fee', value: <span title={t('fee')}>{tx.fee}</span> },
    ],
  ]
  return (
    <div className="card-container">
      <h2 className="card-header border-b pb-3">{`${t('hash')} #${tx.hash}`}</h2>
      <div className="flex justify-center items-center border-b py-3 ">
        <span className="flex-1 text-right">
          {t('from')}
          <Link href={`/account/${tx.from}`}>
            <a>{tx.from}</a>
          </Link>
        </span>
        {'>>>'}
        <span className="flex-1">
          {t('to')}
          <Link href={`/account/${tx.to}`}>
            <a>{tx.to}</a>
          </Link>
        </span>
      </div>
      <CardFieldsetList fieldsetList={fieldsetList} t={t} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<State, { hash: string }> = async ({ res, params }) => {
  const { hash } = params
  try {
    const tx = await fetchTx(hash)
    return { props: tx }
  } catch (err) {
    return handleApiError(err, res)
  }
}
export default Tx
