import { useTranslation } from 'next-i18next'
import { useIsHidden, API } from 'utils'

type State = API.Account.Parsed['polyjuice']

const Polyjuice = ({ script, scriptHash }: State) => {
  const [t] = useTranslation('account')
  const [isHidden, HiddenIcon] = useIsHidden()
  return (
    <div className="md:flex">
      <div className="card-container w-full">
        <h2 className="card-subheader" aria-label="polyjuice">
          {`${t('type')}:`}
          <span>Polyjuice</span>
        </h2>
        <div className="md:my-3">
          <div className="card-field" data-role="script-hash">
            <span className="card-label">{t('l2ScriptHash')}</span>
            <span title={t('l2ScriptHash')}>{scriptHash}</span>
          </div>
          <div className="card-field" attr-last="true">
            <span className="card-label">
              {t('script')}
              <HiddenIcon />
            </span>
            <span className="script-type-badge">{script.name || t('unknownScript')}</span>
          </div>
        </div>
        <pre
          className={isHidden ? 'hidden' : 'script-code mb-3'}
        >{`{\n\t"code_hash": "${script.codeHash}",\n\t"args": "${script.args}",\n\t"hash_type": "${script.hashType}"\n}`}</pre>
      </div>
    </div>
  )
}

export default Polyjuice
