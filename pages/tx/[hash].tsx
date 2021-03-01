import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation, formatDatetime, fetchTx, API, handleApiError, ckbExplorerUrl, imgUrl } from 'utils'
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
      <h2 className="card-header">
        {`${t('hash')}`}
        <span>{`#${tx.hash}`}</span>
      </h2>
      <div className="flex justify-center items-center border-b py-3 capitalize">
        <span className="flex-1 mr-2 overflow-hidden overflow-ellipsis text-right">
          {t('from')}
          <Link href={`/account/${tx.from}`}>
            <a className="ml-1">{tx.from}</a>
          </Link>
        </span>
        <Image src={`${imgUrl}arrow-down-rounded.svg`} width="14" height="14" className="transform -rotate-90" />
        <span className="flex-1 ml-2 overflow-hidden overflow-ellipsis">
          {t('to')}
          <Link href={`/account/${tx.to}`}>
            <a className="ml-1">{tx.to}</a>
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
