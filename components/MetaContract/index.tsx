import type { MetaContract as MetaContractProps } from '../AccountOverview'
import { useTranslation } from 'next-i18next'
import BigNumber from 'bignumber.js'
import InfoList, { InfoItermProps } from '../InfoList'

const MetaContract = ({
  status,
  account_merkle_state,
  block_merkle_state,
  reverted_block_root,
  last_finalized_block_number,
}: MetaContractProps['script']) => {
  const [t] = useTranslation('account')
  const list: Array<InfoItermProps> = [
    {
      field: t(`type`),
      content: `Meta Contract`,
    },
    {
      field: t('status'),
      content: t(status),
    },
    {
      field: t('accountCount'),
      content: new BigNumber(account_merkle_state.account_count).toFormat(),
    },
    {
      field: t('blockCount'),
      content: new BigNumber(block_merkle_state.block_count).toFormat(),
    },
    {
      field: t('lastFinalizedBlockNumber'),
      content: new BigNumber(last_finalized_block_number).toFormat(),
    },
    {
      field: t('accountMerkleRoot'),
      content: <span className="mono-font text-ellipsis">{t(account_merkle_state.account_merkle_root)}</span>,
      tooltipTitle: account_merkle_state.account_merkle_root,
    },
    {
      field: t('blockMerkleRoot'),
      content: <span className="mono-font text-ellipsis">{t(block_merkle_state.block_merkle_root)}</span>,
      tooltipTitle: block_merkle_state.block_merkle_root,
    },
    {
      field: t('revertedBlockRoot'),
      content: <span className="mono-font text-ellipsis">{reverted_block_root}</span>,
      tooltipTitle: reverted_block_root,
    },
  ]
  return <InfoList title={t('basicInfo')} list={list} />
}

export default MetaContract
