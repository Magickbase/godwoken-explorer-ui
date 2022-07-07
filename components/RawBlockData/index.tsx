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

const RawBlockData: React.FC<{ no: number }> = ({ no }) => {
  const [t] = useTranslation('block')
  const blockNo = !Number.isNaN(+no) ? `0x${no.toString(16)}` : null
  const { isLoading, data } = useQuery(
    ['block-raw-data', blockNo],
    () =>
      fetch(`/api/rpc`, {
        method: 'POST',
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_getBlockByNumber',
          params: [blockNo, false],
        }),
      }).then(res => res.json()),
    {
      enabled: !!blockNo,
    },
  )
  return (
    <Stack sx={{ p: '0px 16px 16px 16px' }} spacing={2}>
      <Typography variant="h6" mt={2}>
        {t(`blockRawData`)}
      </Typography>
      {data ? (
        <TextareaAutosize defaultValue={JSON.stringify(data?.result, null, 2)} readOnly style={textareaStyle} />
      ) : isLoading ? (
        <Skeleton variant="rectangular" animation="wave" height="80ch" />
      ) : (
        t(`noData`)
      )}
    </Stack>
  )
}

RawBlockData.displayName = 'RawBlockData'

export default RawBlockData
