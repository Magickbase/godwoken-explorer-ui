import { useTranslation } from 'next-i18next'
import { Skeleton } from '@mui/material'
import InfoList from './InfoList'

const User = ({ nonce, isLoading }: { nonce: number; isLoading: boolean }) => {
  const [t] = useTranslation('account')

  const list = [
    {
      field: t(`type`),
      content: 'User',
    },
    {
      field: t('nonce'),
      content: isLoading ? <Skeleton animation="wave" /> : nonce.toLocaleString('en'),
    },
  ]

  return <InfoList title={t('basicInfo')} list={list} />
}

export default User
