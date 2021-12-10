import type { TFunction } from 'next-i18next'
import { API, formatBalance } from 'utils'

const AssetList = ({ assetList = [], t }: { assetList: Array<API.Account.UDT>; t: TFunction }) => (
  <div className="card-container">
    <h2 className="card-subheader normal-case" aria-label={t('userDefinedAssets')}>
      {`${t('userDefinedAssets')}:`}
      <span>{assetList.length}</span>
    </h2>
    <div className="md:my-3">
      {assetList.length ? (
        assetList.map((asset, i) => (
          <div key={asset.name} className="card-field" attr-last={`${i === assetList.length - 1}`}>
            {asset.icon ? (
              <img src={asset.icon} className="w-10 h-10 rounded-full mr-2" />
            ) : (
              <div className="flex justify-center items-center w-10 h-10 rounded-full mr-2 bg-gray-100 text-lg">
                {asset.name[0]}
              </div>
            )}
            <span className="card-label uppercase">{asset.name}</span>
            <div className="flex-1 text-right">{formatBalance(asset.balance)}</div>
          </div>
        ))
      ) : (
        <div className="my-3 md:my-0">{t('emptyAssetList')}</div>
      )}
    </div>
  </div>
)

export default AssetList
