import { useTranslation } from 'next-i18next'
import { API } from 'utils'
import CardFieldsetList, { CardFieldsetListProps } from 'components/CardFieldsetList'

type State = API.Account.Parsed['metaContract']

const MetaContract = ({
  status,
  accountMerkleState,
  blockMerkleState,
  revertedBlockRoot,
  lastFinalizedBlockNumber,
}: State) => {
  const [t] = useTranslation('account')
  const fieldsetList: CardFieldsetListProps['fieldsetList'] = [
    [
      { label: t('status'), value: <span title={t('status')}>{status}</span> },
      {
        label: t('accountMerkleState'),
        value: (
          <span title={t('accountMerkleState')}>
            {Object.keys(accountMerkleState)
              .map(field => `${field}: ${accountMerkleState[field]}`)
              .join(', ')}
          </span>
        ),
      },
      {
        label: t('blockMerkleState'),
        value: (
          <span title={t('blockMerkleState')}>
            {Object.keys(blockMerkleState)
              .map(field => `${field}: ${blockMerkleState[field]}`)
              .join(', ')}
          </span>
        ),
      },
    ],
    [
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
      <h2 className="card-subheader">
        {`${t('type')}:`}
        <span>Meta Contract</span>
      </h2>
      <CardFieldsetList fieldsetList={fieldsetList} t={t} />
    </div>
  )
}

export default MetaContract
