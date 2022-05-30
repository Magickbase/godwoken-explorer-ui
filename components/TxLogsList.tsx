import { useTranslation } from 'next-i18next'
import { Box, Stack, Typography } from '@mui/material'
import { formatBalance, nameToColor, ParsedEventLog } from 'utils'
import { useEffect } from 'react'

const TxLogsList = ({ list }: { list: ParsedEventLog[] }) => {
  const [t] = useTranslation('tx')
  return <div>{list?.length ? list.map(item => <p key={item.id}>{}</p>) : <p>{t('noLogs')}</p>}</div>
}

export default TxLogsList
