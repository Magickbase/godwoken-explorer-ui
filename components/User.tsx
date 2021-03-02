import { useTranslation } from 'next-i18next'
import { useIsHidden } from 'utils'
import AssetList from 'components/AssetList'

const User = () => {
  const [t] = useTranslation('account')
  const [isHidden, HiddenIcon] = useIsHidden()
  const infoList = [
    { label: t('ethAddr'), value: <span title={t('ethAddr')}>0xbd215e27867bcf0faa04fd563a7b9ce559674a83</span> },
    { label: t('nonce'), value: <span title={t('nonce')}>nonce</span> },
    { label: t('ckbAddr'), value: <span title={t('ckbAddr')}>ckt1qyqw975zuu9svtyxgjuq44lv7mspte0n2tmqa703cd</span> },
  ]
  const assetList = [
    { label: 'udt 1', value: 'udt 1' },
    { label: 'udt 2', value: 'udt 2' },
  ]
  const script = {
    codeHash: 'code hash',
    hashType: 'type',
    args: 'args',
    name: '',
  }

  return (
    <div className="md:flex">
      <div className="card-container md:mr-2 md:w-1/2 self-start">
        <h2 className="card-subheader">
          {`${t('type')}:`}
          <span>User</span>
        </h2>
        <div className="md:my-3">
          {infoList.map(i => (
            <div key={i.label} className="card-field">
              <span className="card-label">{i.label}</span>
              {i.value}
            </div>
          ))}
          <div className="card-field" attr-last="true">
            <span className="card-label">
              {t('ckbLockScript')}
              <HiddenIcon />
            </span>
            <span className="script-type-badge">{script.name || t('unknownScript')}</span>
          </div>
        </div>
        <pre
          className={isHidden ? 'hidden' : 'script-code mb-3'}
        >{`{\n\t"code_hash": "${script.codeHash}",\n\t"args": "${script.args}",\n\t"hash_type": "${script.hashType}"\n}`}</pre>
      </div>
      <AssetList assetList={assetList} t={t} />
    </div>
  )
}

export default User
