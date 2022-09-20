import type { MetaContract as MetaContractProps } from '../AccountOverview'
import { useTranslation } from 'next-i18next'
import Tooltip from 'components/Tooltip'
import BigNumber from 'bignumber.js'
import InfoList from '../InfoList'
// import BaseTooltip from './BaseTooltip'

import styles from './styles.module.scss'

const MetaContract = ({
  status,
  account_merkle_state,
  block_merkle_state,
  reverted_block_root,
  last_finalized_block_number,
}: MetaContractProps['script']) => {
  const [t] = useTranslation('account')
  const list: Array<{ field: string; content: React.ReactNode }> = [
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
      content: (
        // <BaseTooltip title={account_merkle_state.account_merkle_root} placement="top" zIndex={1000}>
        //   <span className="mono-font">{t(account_merkle_state.account_merkle_root)}</span>
        // </BaseTooltip>
        // <Tooltip title={account_merkle_state.account_merkle_root} placement="top">
        // <div>
        <span className={`mono-font ${styles['tooltip']}`} data-title="tooltip-test-title">
          {t(account_merkle_state.account_merkle_root)}
        </span>
        // </div>
        // </Tooltip>
      ),
    },
    {
      field: t('blockMerkleRoot'),
      content: (
        <Tooltip title={block_merkle_state.block_merkle_root} placement="top">
          <span className="mono-font">{t(block_merkle_state.block_merkle_root)}</span>
        </Tooltip>
      ),
    },
    {
      field: t('revertedBlockRoot'),
      content: (
        <Tooltip title={reverted_block_root} placement="top">
          <span className="mono-font">{reverted_block_root}</span>
        </Tooltip>
      ),
    },
  ]
  return <InfoList title={t('basicInfo')} list={list} />
}

export default MetaContract
