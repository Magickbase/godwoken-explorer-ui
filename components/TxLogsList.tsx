import { useTranslation } from 'next-i18next'
import { Box, Divider, Stack, Typography } from '@mui/material'
import { ParsedEventLog } from 'utils'
import TxLogListItem from './TxLogListItem'

const TxLogsList = ({ list }: { list: ParsedEventLog[] }) => {
  const [t] = useTranslation('tx')
  const listItems = list.filter(item => item !== null)

  return listItems?.length ? (
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
        {listItems.map(item => item && <TxLogListItem key={item.id} item={item} />)}
      </Stack>
    </Box>
  ) : (
    <Box>{t('noLogs')}</Box>
  )
}

export default TxLogsList
