import type { TFunction } from 'next-i18next'

const AssetList = ({ assetList, t }: { assetList: Array<Record<'label' | 'value', string>>; t: TFunction }) => (
  <div className="card-container md:ml-2 md:w-1/2 md:self-start">
    <h2 className="card-subheader">
      {`${t('userDefinedAssets')}:`}
      <span>{assetList.length}</span>
    </h2>
    <div className="md:my-3">
      {assetList.map((asset, i) => (
        <div key={asset.label} className="card-field" attr-last={`${i === assetList.length - 1}`}>
          <span className="card-label uppercase">{asset.label}</span>
          {asset.value}
        </div>
      ))}
    </div>
  </div>
)

export default AssetList
