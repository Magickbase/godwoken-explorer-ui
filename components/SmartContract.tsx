import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import AssetList from 'components/AssetList'

const SmartContract = () => {
  const txHash = 'tx hash'
  const [t] = useTranslation('account')
  const infoList = [
    {
      label: t('deployTx'),
      value: (
        <Link href={`/tx/${txHash}`}>
          <a title={t('deployTx')}>{txHash}</a>
        </Link>
      ),
    },
  ]
  const assetList = [
    { label: 'udt 1', value: '1111111111' },
    { label: 'udt 2', value: '22222222' },
  ]

  return (
    <div className="md:flex">
      <div className="card-container md:mr-2 md:w-1/2 self-start">
        <h2 className="card-subheader">
          {`${t('type')}:`}
          <span>Smart Contract</span>
        </h2>
        <div className="md:my-3">
          {infoList.map(i => (
            <div key={i.label} className="card-field border-b-0">
              <span className="card-label">{i.label}</span>
              {i.value}
            </div>
          ))}
        </div>
      </div>
      <AssetList assetList={assetList} t={t} />
    </div>
  )
}

export default SmartContract
