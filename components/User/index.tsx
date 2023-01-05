import { useTranslation } from 'next-i18next'
import { Skeleton } from '@mui/material'
import InfoList from 'components/InfoList'
import TitleWithDomain from 'components/TitleWithDomain'

const User = ({ nonce, isLoading, domain }: { nonce: number; isLoading: boolean; domain: string }) => {
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

  return <InfoList title={domain ? <TitleWithDomain domain={domain} /> : t('basicInfo')} list={list} />
}

export default User
