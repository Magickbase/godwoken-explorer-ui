import { useTranslation } from 'next-i18next'
import { Box, Container, Stack, Typography } from '@mui/material'
import { formatBalance, nameToColor, ParsedEventLog } from 'utils'

const ContractEventsList = ({ list }: { list: ParsedEventLog[] }) => {
  const [t] = useTranslation('account')
  return <div>{list?.length ? list.map(item => <div key={item.id}>{item}</div>) : <div>{t('noEvents')}</div>}</div>
}

export default ContractEventsList
