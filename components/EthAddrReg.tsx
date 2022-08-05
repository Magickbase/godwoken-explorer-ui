import { useTranslation } from 'next-i18next'
import InfoList from './InfoList'

const EthAddrReg = () => {
  const [t] = useTranslation('account')

  return (
    <InfoList
      title={t('basicInfo')}
      list={[
        {
          field: t(`type`),
          content: 'Eth Addr Reg',
        },
        {
          field: '',
          content: <div data-role="placeholder" style={{ height: '1.5rem' }}></div>,
        },
      ]}
    />
  )
}

export default EthAddrReg
