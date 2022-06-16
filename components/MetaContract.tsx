import { useTranslation } from 'next-i18next'
import { List, ListItem, ListItemText, ListSubheader, Divider, Typography, Tooltip } from '@mui/material'
import BigNumber from 'bignumber.js'
import type { MetaContract as MetaContractProps } from './AccountOverview'

const MetaContract = ({
  status,
  account_merkle_state,
  block_merkle_state,
  reverted_block_root,
  last_finalized_block_number,
}: MetaContractProps['script']) => {
  const [t] = useTranslation('account')
  const fields: Array<{ label: string; value: React.ReactNode }> = [
    {
      label: t(`type`),
      value: <Typography variant="body2">{`Meta Contract`}</Typography>,
    },
    {
      label: t('status'),
      value: <Typography variant="body2">{t(status)}</Typography>,
    },
    {
      label: t('accountCount'),
      value: <Typography variant="body2">{new BigNumber(account_merkle_state.account_count).toFormat()}</Typography>,
    },
    {
      label: t('blockCount'),
      value: <Typography variant="body2">{new BigNumber(block_merkle_state.block_count).toFormat()}</Typography>,
    },
    {
      label: t('lastFinalizedBlockNumber'),
      value: <Typography variant="body2">{new BigNumber(last_finalized_block_number).toFormat()}</Typography>,
    },
    {
      label: t('accountMerkleRoot'),
      value: (
        <Tooltip title={account_merkle_state.account_merkle_root} placement="top">
          <Typography variant="body2" overflow="hidden" textOverflow="ellipsis" className="mono-font">
            {t(account_merkle_state.account_merkle_root)}
          </Typography>
        </Tooltip>
      ),
    },
    {
      label: t('blockMerkleRoot'),
      value: (
        <Tooltip title={block_merkle_state.block_merkle_root} placement="top">
          <Typography variant="body2" overflow="hidden" textOverflow="ellipsis" className="mono-font">
            {t(block_merkle_state.block_merkle_root)}
          </Typography>
        </Tooltip>
      ),
    },
    {
      label: t('revertedBlockRoot'),
      value: (
        <Tooltip title={reverted_block_root} placement="top">
          <Typography variant="body2" overflow="hidden" textOverflow="ellipsis" className="mono-font">
            {reverted_block_root}
          </Typography>
        </Tooltip>
      ),
    },
  ]
  return (
    <List
      subheader={
        <ListSubheader component="div" sx={{ textTransform: 'capitalize', bgcolor: 'transparent' }}>
          {t('basicInfo')}
        </ListSubheader>
      }
      sx={{ textTransform: 'capitalize' }}
    >
      <Divider variant="middle" />
      {fields.map(field => (
        <ListItem key={field.label}>
          <ListItemText
            primary={field.label}
            secondary={
              <Typography variant="body2" overflow="hidden" textOverflow="ellipsis">
                {field.value}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  )
}

export default MetaContract
