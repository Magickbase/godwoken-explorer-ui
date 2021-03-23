import { useTranslation } from 'next-i18next'
import { API } from 'utils'

type State = API.Account.Parsed['metaContract']

const MetaContract = ({
  status,
  accountMerkleState,
  blockMerkleState,
  revertedBlockRoot,
  lastFinalizedBlockNumber,
}: State) => {
  const [t] = useTranslation('account')
  const fieldsetList: Array<Array<{ label: string; value: React.ReactNode }>> = [
    [
      {
        label: t('status'),
        value: (
          <span title={t('status')} className="capitalize">
            {t(status)}
          </span>
        ),
      },
      {
        label: t('accountCount'),
        value: (
          <span title={t('accountCount')} className="capitalize">
            {t(BigInt(accountMerkleState.accountCount).toLocaleString('en'))}
          </span>
        ),
      },
      {
        label: t('accountMerkleRoot'),
        value: (
          <span title={t('accountMerkleRoot')} className="capitalize">
            {t(accountMerkleState.accountMerkleRoot)}
          </span>
        ),
      },
      {
        label: t('blockCount'),
        value: (
          <span title={t('blockCount')} className="capitalize">
            {t(BigInt(blockMerkleState.blockCount).toLocaleString('en'))}
          </span>
        ),
      },
      {
        label: t('blockMerkleRoot'),
        value: (
          <span title={t('blockMerkleRoot')} className="capitalize">
            {t(blockMerkleState.blockMerkleRoot)}
          </span>
        ),
      },
      { label: t('revertedBlockRoot'), value: <span title={t('revertedBlockRoot')}>{revertedBlockRoot}</span> },
      {
        label: t('lastFinalizedBlockNumber'),
        value: (
          <span title={t('lastFinalizedBlockNumber')}>{BigInt(lastFinalizedBlockNumber).toLocaleString('en')}</span>
        ),
      },
    ],
  ]
  return (
    <div className="card-container">
      <h2 className="card-subheader" aria-label="meta contract">
        {`${t('type')}:`}
        <span>Meta Contract</span>
      </h2>
      <div className="md:flex divide-x divide-light-grey md:my-3">
        {fieldsetList.map((fieldset, fidx) => (
          <div key={fieldset.map(i => i?.label ?? '').join()} className="card-fieldset w-full md:odd:pr-0">
            {fieldset
              .filter(i => i)
              .map((i, idx) => (
                <div
                  key={i.label}
                  className="card-field md:justify-start md:border-b"
                  attr-last={`${fidx === fieldsetList.length - 1 && idx === fieldset.length - 1}`}
                >
                  <span className="card-label w-52">{t(i.label)}</span>
                  {i.value}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MetaContract
