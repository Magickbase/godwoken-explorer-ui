import { useTranslation } from 'next-i18next'
import { List, ListItem, ListItemText, ListSubheader, Divider, Typography, Tooltip } from '@mui/material'
import { formatInt } from 'utils'
import { API } from 'utils/api/utils'

type State = API.Account.Parsed['metaContract']

const MetaContract = ({
  status,
  accountMerkleState,
  blockMerkleState,
  revertedBlockRoot,
  lastFinalizedBlockNumber,
}: State) => {
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
      value: <Typography variant="body2">{formatInt(accountMerkleState.accountCount)}</Typography>,
    },
    {
      label: t('blockCount'),
      value: <Typography variant="body2">{formatInt(blockMerkleState.blockCount)}</Typography>,
    },
    {
      label: t('lastFinalizedBlockNumber'),
      value: <Typography variant="body2">{formatInt(lastFinalizedBlockNumber)}</Typography>,
    },
    {
      label: t('accountMerkleRoot'),
      value: (
        <Tooltip title={accountMerkleState.accountMerkleRoot} placement="top">
          <Typography variant="body2" overflow="hidden" textOverflow="ellipsis" className="mono-font">
            {t(accountMerkleState.accountMerkleRoot)}
          </Typography>
        </Tooltip>
      ),
    },
    {
      label: t('blockMerkleRoot'),
      value: (
        <Tooltip title={blockMerkleState.blockMerkleRoot} placement="top">
          <Typography variant="body2" overflow="hidden" textOverflow="ellipsis" className="mono-font">
            {t(blockMerkleState.blockMerkleRoot)}
          </Typography>
        </Tooltip>
      ),
    },
    {
      label: t('revertedBlockRoot'),
      value: (
        <Tooltip title={revertedBlockRoot} placement="top">
          <Typography variant="body2" overflow="hidden" textOverflow="ellipsis" className="mono-font">
            {revertedBlockRoot}
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
