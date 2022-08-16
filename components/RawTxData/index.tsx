import { Skeleton } from '@mui/material'
import { useQuery } from 'react-query'
import { useTranslation } from 'next-i18next'
import { NODE_URL } from 'utils'
import styles from './styles.module.scss'

const RawTxData: React.FC<{ hash: string }> = ({ hash }) => {
  const [t] = useTranslation('tx')
  const { isLoading: isTxLoading, data: tx } = useQuery(
    ['tx-raw-data', hash],
    () =>
      fetch(NODE_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_getTransactionByHash',
          params: [hash],
        }),
      })
        .then(res => res.json())
        .catch(() => null),
    {
      enabled: !!hash,
    },
  )

  const { isLoading: isTxReceiptLoading, data: txReceipt } = useQuery(
    ['tx-receipt-raw-data', hash],
    () =>
      fetch(NODE_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_getTransactionReceipt',
          params: [hash],
        }),
      })
        .then(res => res.json())
        .catch(() => null),
    { enabled: !!hash },
  )

  return (
    <div className={styles.container}>
      <h6>{t(`txRawData`)}</h6>
      {tx ? (
        <textarea defaultValue={JSON.stringify(tx, null, 2)} readOnly />
      ) : isTxLoading ? (
        <Skeleton variant="rectangular" animation="wave" height="80ch" />
      ) : (
        t(`noData`)
      )}

      <h6>{t(`txReceiptRawData`)}</h6>
      {txReceipt ? (
        <textarea defaultValue={JSON.stringify(txReceipt, null, 2)} readOnly />
      ) : isTxReceiptLoading ? (
        <Skeleton variant="rectangular" animation="wave" height="80ch" />
      ) : (
        t(`noData`)
      )}
    </div>
  )
}

RawTxData.displayName = 'RawTxData'

export default RawTxData
