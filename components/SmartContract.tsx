import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { API } from 'utils'
import AssetList from 'components/AssetList'

type State = API.Account.Parsed['smartContract']

const SmartContract = ({ txHash, udtList }: State) => {
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

  return (
    <div className="md:flex">
      <div className="card-container md:mr-2 md:w-1/2 self-start">
        <h2 className="card-subheader" aria-label="smart contract">
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
      <AssetList assetList={udtList} t={t} />
    </div>
  )
}

export default SmartContract
