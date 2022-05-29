import { useTranslation } from 'next-i18next'
import { Box, Stack, Typography } from '@mui/material'
import { formatBalance, nameToColor, ParsedLog } from 'utils'

const TxLogsList = ({ list }: { list: ParsedLog[] }) => {
  const [t] = useTranslation('tx')
  return (
    <div>
      {list?.length ? list.map(item => <div key={item.id}>{JSON.stringify(item)}</div>) : <div>{t('noLogs')}</div>}
    </div>
  )
}

export default TxLogsList
