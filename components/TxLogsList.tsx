import { useTranslation } from 'next-i18next'
import { Box, Divider, Stack, Typography } from '@mui/material'
import { ParsedEventLog } from 'utils'
import TxLogListItem from './TxLogListItem'

const TxLogsList = ({ list }: { list: ParsedEventLog[] }) => {
  const [t] = useTranslation('tx')

  return list?.length ? (
    <Box sx={{ m: 2, mr: 4 }}>
      <Typography variant="body2" sx={{ color: '#333333' }}>
        {t('txReceiptEventLogs')}
      </Typography>
      <Stack
        direction="column"
        justifyContent="flex-start"
        alignItems="center"
        spacing={0}
        divider={<Divider orientation="horizontal" flexItem />}
      >
        {list
          .sort((a, b) => a.id - b.id)
          .map(item => (
            <TxLogListItem key={item.id} item={item} />
          ))}
      </Stack>
    </Box>
  ) : (
    <Stack sx={{ minHeight: 50 }} justifyContent="center" alignItems="center">
      <Typography>{t('noLogs')}</Typography>
    </Stack>
  )
}

export default TxLogsList
