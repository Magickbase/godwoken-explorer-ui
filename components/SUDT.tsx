import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { useIsHidden, scriptToHash, IMG_URL, API } from 'utils'
import CardFieldsetList, { CardFieldsetListProps } from 'components/CardFieldsetList'

type State = API.Account.Parsed['sudt']

const SUDT = ({ name, symbol, decimal, supply, holders, icon, typeScript }: State) => {
  const [t] = useTranslation('account')
  const [isHidden, HiddenIcon] = useIsHidden()

  const fieldsetList: CardFieldsetListProps['fieldsetList'] = [
    [
      { label: t('name'), value: <span title={t('name')}>{name}</span> },
      {
        label: t('symbol'),
        value: (
          <div className="flex items-center gap-1" title={t('symbol')}>
            <Image src={icon || `${IMG_URL}unknown-token.svg`} width="15" height="15" loading="lazy" layout="fixed" />
            {symbol}
          </div>
        ),
      },
      { label: t('decimal'), value: <span title={t('decimal')}>{decimal}</span> },
    ],
    [
      { label: t('l2Supply'), value: <span title={t('l2Supply')}>{BigInt(supply).toLocaleString('en')}</span> },
      {
        label: t('holders'),
        value: <span title={t('holders')}>{BigInt(holders).toLocaleString('en')}</span>,
      },
    ],
  ]

  return (
    <div className="card-container">
      <h2 className="card-subheader" aria-label="sudt">
        {`${t('type')}:`}
        <span className="normal-case">sUDT</span>
      </h2>

      <CardFieldsetList fieldsetList={fieldsetList} t={t} />

      {typeScript ? (
        <>
          <div className="md:my-3 border-t border-dashed border-light-grey md:border-t-0">
            <div className="card-field" attr-last="true" data-role="type-hash">
              <span className="card-label">{t('l1TypeHash')}</span>
              <span title={t('l1TypeHash')}>{scriptToHash(typeScript as CKBComponents.Script)}</span>
            </div>
          </div>

          <div className="md:my-3 border-t border-dashed border-light-grey md:border-t-0">
            <div className="card-field" attr-last="true">
              <span className="card-label">
                {t('l1TypeScript')}
                <HiddenIcon />
              </span>
              <span className="script-type-badge">{typeScript.name || t('unknownScript')}</span>
            </div>
          </div>
          <pre
            className={isHidden ? 'hidden' : 'script-code mb-3'}
          >{`{\n\t"code_hash": "${typeScript.codeHash}",\n\t"args": "${typeScript.args}",\n\t"hash_type": "${typeScript.hashType}"\n}`}</pre>
        </>
      ) : null}
    </div>
  )
}

export default SUDT
