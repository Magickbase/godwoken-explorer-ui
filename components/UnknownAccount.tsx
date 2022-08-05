import { useTranslation } from 'next-i18next'
import InfoList from './InfoList'

const User = ({ nonce }: { nonce: number }) => {
  const [t] = useTranslation('account')

  const list = [
    {
      field: t(`type`),
      content: 'Unknown',
    },
    { field: t('nonce'), content: nonce.toLocaleString('en') },
  ]

  return <InfoList title={t(`basicInfo`)} list={list} />
}

export default User
