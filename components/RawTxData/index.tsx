import { Stack, Typography, TextareaAutosize, Skeleton } from '@mui/material'
import { useQuery } from 'react-query'
import { useTranslation } from 'next-i18next'

const textareaStyle: React.CSSProperties = {
  padding: '8px',
  resize: 'vertical',
  height: '80ch',
  overflow: 'auto',
  background: '#F9F9F9',
  color: '#080808',
  borderRadius: '4px',
  borderColor: '#ddd',
}

const RawTxData: React.FC<{ hash: string }> = ({ hash }) => {
  const [t] = useTranslation('tx')
  const { isLoading: isTxLoading, data: tx } = useQuery(
    ['tx-raw-data', hash],
    () =>
      fetch(`/api/rpc`, {
        method: 'POST',
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_getTransactionByHash',
          params: [hash],
        }),
      }).then(res => res.json()),
    {
      enabled: !!hash,
    },
  )

  const { isLoading: isTxReceiptLoading, data: txReceipt } = useQuery(
    ['tx-raw-data', hash],
    () =>
      fetch(`/api/rpc`, {
        method: 'POST',
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_getTransactionReceipt',
          params: [hash],
        }),
      }).then(res => res.json()),
    {
      enabled: !!hash,
    },
  )

  return (
    <Stack sx={{ p: '0px 16px 16px 16px' }} spacing={2}>
      <Typography variant="h6" mt={2}>
        {t(`txRawData`)}
      </Typography>
      {tx ? (
        <TextareaAutosize defaultValue={JSON.stringify(tx?.result, null, 2)} readOnly style={textareaStyle} />
      ) : isTxLoading ? (
        <Skeleton variant="rectangular" animation="wave" height="80ch" />
      ) : (
        t(`noData`)
      )}

      <Typography variant="h6" mt={2}>
        {t(`txReceiptRawData`)}
      </Typography>
      {txReceipt ? (
        <TextareaAutosize defaultValue={JSON.stringify(txReceipt?.result, null, 2)} readOnly style={textareaStyle} />
      ) : isTxReceiptLoading ? (
        <Skeleton variant="rectangular" animation="wave" height="80ch" />
      ) : (
        t(`noData`)
      )}
    </Stack>
  )
}

RawTxData.displayName = 'RawTxData'

export default RawTxData
