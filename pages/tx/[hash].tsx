import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { formatDatetime, fetchTx, API, handleApiError, CKB_EXPLORER_URL, IMG_URL } from 'utils'
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
            <a title={t('l2Block')}>{BigInt(tx.l2Block).toLocaleString('en')}</a>
          </Link>
        ),
      },
      {
        label: 'l1Block',
        value: (
          <Link href={`${CKB_EXPLORER_URL}/block/${tx.l1Block}`}>
            <a title={t('l1Block')}>{BigInt(tx.l1Block).toLocaleString('en')}</a>
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
      {
        label: 'finalizeState',
        value: (
          <span className="capitalize" title={t('finalizeState')}>
            {t(tx.finalizeState)}
          </span>
        ),
      },
    ],
    [
      { label: 'nonce', value: <span title={t('nonce')}>{Number(tx.nonce).toLocaleString('en')}</span> },
      { label: 'args', value: <span title={t('args')}>{tx.args}</span> },
      tx.gasPrice
        ? { label: 'gasPrice', value: <span title={t('gasPrice')}>{Number(tx.gasPrice).toLocaleString('en')}</span> }
        : null,
      { label: 'fee', value: <span title={t('fee')}>{Number(tx.fee).toLocaleString('en')}</span> },
    ],
  ]
  return (
    <div className="card-container mt-8">
      <h2 className="card-header">
        {`${t('hash')}`}
        <span>{`#${tx.hash}`}</span>
      </h2>
      <div className="flex justify-center items-center border-b border-light-grey py-3 capitalize">
        <span className="flex-1 mr-2 overflow-hidden overflow-ellipsis text-right">
          {t('from')}
          <Link href={`/account/${tx.from}`}>
            <a className="ml-1">{tx.from}</a>
          </Link>
        </span>
        <Image src={`${IMG_URL}arrow-down-rounded.svg`} width="14" height="14" className="transform -rotate-90" />
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

export const getServerSideProps: GetServerSideProps<State, { hash: string }> = async ({ locale, res, params }) => {
  const { hash } = params
  try {
    const tx = await fetchTx(hash)
    const lng = await serverSideTranslations(locale, ['tx'])
    return { props: { ...tx, ...lng } }
  } catch (err) {
    return handleApiError(err, res)
  }
}
export default Tx
