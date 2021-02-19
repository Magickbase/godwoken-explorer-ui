import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useTranslation, formatDatetime, fetchTx, API, handleApiError, ckbExplorerUrl } from 'utils'

type State = API.Tx.Parsed

const Tx = (initState: State) => {
  const [tx, setTx] = useState(initState)
  const [t] = useTranslation('tx')
  const infoList = [
    { label: 'hash', value: tx.hash },
    { label: 'timestamp', value: formatDatetime(+tx.timestamp) },
    { label: 'finalizeState', value: tx.finalizeState },
    {
      label: 'l2Block',
      value: (
        <Link href={`/block/${tx.l2Block}`}>
          <a>{tx.l2Block}</a>
        </Link>
      ),
    },
    {
      label: 'l1Block',
      value: (
        <Link href={`${ckbExplorerUrl}block/${tx.l1Block}`}>
          <a>{tx.l1Block}</a>
        </Link>
      ),
    },
    {
      label: 'from',
      value: (
        <Link href={`/account/${tx.from}`}>
          <a>{tx.from}</a>
        </Link>
      ),
    },
    {
      label: 'to',
      value: (
        <Link href={`/account/${tx.to}`}>
          <a>{tx.to}</a>
        </Link>
      ),
    },
    { label: 'nonce', value: tx.nonce },
    { label: 'args', value: tx.args },
    { label: 'type', value: tx.type },
    { label: 'gasPrice', value: tx.gasPrice },
    { label: 'fee', value: tx.fee },
  ]
  return (
    <>
      <div className="basic-info-list">
        {infoList.map(info => (
          <div key={info.label}>
            <span>{t(info.label)}</span>
            <div>{info.value}</div>
          </div>
        ))}
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<State, { hash: string }> = async ({ res, params }) => {
  const { hash } = params
  try {
    const tx = await fetchTx(hash)
    return { props: tx }
  } catch (err) {
    handleApiError(err, res)
  }
}
export default Tx
