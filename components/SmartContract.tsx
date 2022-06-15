import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { Tooltip, List, ListItem, ListItemText, ListSubheader, Divider, Typography, Link } from '@mui/material'

// type State = API.Account.Parsed['smartContract']

const SmartContract: React.FC<Record<'deployer' | 'txHash', string>> = ({ deployer, txHash }) => {
  const [t] = useTranslation('account')
  const fields = [
    {
      label: t('type'),
      value: <Typography variant="body2">{'Smart Contract'}</Typography>,
    },
    deployer
      ? {
          label: t('deployer'),
          value: (
            <Tooltip title={deployer} placement="top">
              <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <NextLink href={`/account/${deployer}`}>
                  <Link href={`/account/${deployer}`} underline="none" className="mono-font" color="secondary">
                    {deployer}
                  </Link>
                </NextLink>
              </Typography>
            </Tooltip>
          ),
        }
      : null,
    txHash
      ? {
          label: t('deployTx'),
          value: (
            <Tooltip title={txHash} placement="top">
              <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <NextLink href={`/tx/${txHash}`}>
                  <Link href={`/tx/${txHash}`} underline="none" className="mono-font" color="secondary">
                    {txHash}
                  </Link>
                </NextLink>
              </Typography>
            </Tooltip>
          ),
        }
      : null,
  ]

  return (
    <List
      subheader={
        <ListSubheader component="div" sx={{ textTransform: 'capitalize', bgcolor: 'transparent' }}>
          {t(`basicInfo`)}
        </ListSubheader>
      }
      sx={{ textTransform: 'capitalize' }}
    >
      <Divider variant="middle" />
      {fields.map(field =>
        field ? (
          <ListItem key={field.label}>
            <ListItemText
              primary={field.label}
              secondary={field.value}
              secondaryTypographyProps={{ component: 'div' }}
            />
          </ListItem>
        ) : null,
      )}
    </List>
  )
}

export default SmartContract
