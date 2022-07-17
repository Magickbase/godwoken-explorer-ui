import { Stack, Typography, TextareaAutosize, Skeleton } from '@mui/material'
import { useQuery } from 'react-query'
import { useTranslation } from 'next-i18next'
import { provider } from 'utils'

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
  const { isLoading: isTxLoading, data: tx } = useQuery(['tx-raw-data', hash], () => provider.getTransaction(hash), {
    enabled: !!hash,
  })
  const { isLoading: isTxReceiptLoading, data: txReceipt } = useQuery(
    ['tx-receipt-raw-data', hash],
    () => provider.getTransactionReceipt(hash),
    { enabled: !!hash },
  )

  return (
    <Stack sx={{ p: '0px 16px 16px 16px' }} spacing={2}>
      <Typography variant="h6" mt={2} fontSize={16}>
        {t(`txRawData`)}
      </Typography>
      {tx ? (
        <TextareaAutosize defaultValue={JSON.stringify(tx, null, 2)} readOnly style={textareaStyle} />
      ) : isTxLoading ? (
        <Skeleton variant="rectangular" animation="wave" height="80ch" />
      ) : (
        t(`noData`)
      )}

      <Typography variant="h6" mt={2} fontSize={16}>
        {t(`txReceiptRawData`)}
      </Typography>
      {txReceipt ? (
        <TextareaAutosize defaultValue={JSON.stringify(txReceipt, null, 2)} readOnly style={textareaStyle} />
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
