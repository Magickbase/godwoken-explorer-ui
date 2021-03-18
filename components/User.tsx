import { useTranslation } from 'next-i18next'
import { useIsHidden, scriptToCkbAddress, API } from 'utils'
import AssetList from 'components/AssetList'

type State = API.Account.Parsed['user']
const User = ({ ethAddr, nonce, udtList, ckbLockScript }: State) => {
  const [t] = useTranslation('account')
  const [isHidden, HiddenIcon] = useIsHidden()
  let ckbAddr = '-'
  try {
    ckbAddr = scriptToCkbAddress(ckbLockScript as CKBComponents.Script)
  } catch (err) {
    console.warn(err)
  }

  const infoList = [
    { label: t('ethAddr'), value: <span title={t('ethAddr')}>{ethAddr || '-'} </span> },
    { label: t('nonce'), value: <span title={t('nonce')}>{BigInt(nonce).toLocaleString('en')}</span> },
    { label: t('ckbAddr'), value: <span title={t('ckbAddr')}>{ckbAddr}</span> },
  ]

  return (
    <div className="md:flex">
      <div className="card-container md:mr-2 md:w-1/2 self-start">
        <h2 className="card-subheader" aria-label="user">
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
            <span className="script-type-badge">{ckbLockScript?.name || t('unknownScript')}</span>
          </div>
        </div>
        <pre className={isHidden ? 'hidden' : 'script-code mb-3'}>{`{\n\t"code_hash": "${
          ckbLockScript?.codeHash ?? ''
        }",\n\t"args": "${ckbLockScript?.args ?? ''}",\n\t"hash_type": "${ckbLockScript?.hashType ?? ''}"\n}`}</pre>
      </div>
      <AssetList assetList={udtList} t={t} />
    </div>
  )
}

export default User
