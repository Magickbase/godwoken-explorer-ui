import { useState } from 'react'
import { useTranslation } from 'utils'
import CardFieldsetList, { CardFieldsetListProps } from 'components/CardFieldsetList'

const SUDT = () => {
  const [t] = useTranslation('account')

  const [isHidden, setisHidden] = useState(true)
  const script = {
    codeHash: 'code hash',
    hashType: 'type',
    args: 'args',
    name: '',
  }
  const handleShowScript = () => setisHidden(h => !h)

  const fieldsetList: CardFieldsetListProps['fieldsetList'] = [
    [
      { label: t('name'), value: <span title={t('name')}>name</span> },
      { label: t('symbol'), value: <span title={t('symbol')}>symbol</span> },
      { label: t('decimal'), value: <span title={t('decimal')}>decimal</span> },
    ],
    [
      { label: t('l2Supply'), value: <span title={t('l2Supply')}>l2Supply</span> },
      {
        label: t('holders'),
        value: <span title={t('holders')}>holders</span>,
      },
    ],
  ]
  return (
    <div className="card-container">
      <h2 className="card-subheader">
        {`${t('type')}:`}
        <span className="normal-case">sUDT</span>
      </h2>
      <CardFieldsetList fieldsetList={fieldsetList} t={t} />
      <div className="md:my-3 border-t border-dashed border-light-grey md:border-t-0">
        <div className="card-field" attr-last="true">
          <span className="card-label">
            {t('l1TypeScript')}
            <span onClick={handleShowScript}>
              {isHidden ? 'show' : 'hide'}
              <i className="iconfont godwoken-show-more" />
            </span>
          </span>
          <span className="script-type-badge">{script.name || t('unknownScript')}</span>
        </div>
      </div>
      <pre
        className={isHidden ? 'hidden' : 'script-code mb-3'}
      >{`{\n\t"code_hash": "${script.codeHash}",\n\t"args": "${script.args}",\n\t"hash_type": "${script.hashType}"\n}`}</pre>
    </div>
  )
}

export default SUDT
