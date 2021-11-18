import type { TFunction } from 'next-i18next'
import { formatBalance } from 'utils'

const AssetList = ({ assetList = [], t }: { assetList: Array<Record<'name' | 'balance', string>>; t: TFunction }) => (
  <div className="card-container">
    <h2 className="card-subheader normal-case" aria-label={t('userDefinedAssets')}>
      {`${t('userDefinedAssets')}:`}
      <span>{assetList.length}</span>
    </h2>
    <div className="md:my-3">
      {assetList.length ? (
        assetList.map((asset, i) => (
          <div key={asset.name} className="card-field" attr-last={`${i === assetList.length - 1}`}>
            <span className="card-label uppercase">{asset.name}</span>
            {formatBalance(asset.balance)}
          </div>
        ))
      ) : (
        <div className="my-3 md:my-0">{t('emptyAssetList')}</div>
      )}
    </div>
  </div>
)

export default AssetList
