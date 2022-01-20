import { useTranslation } from 'next-i18next'
import { List, ListItem, ListItemText, ListSubheader, Divider, Typography } from '@mui/material'

// type State = API.Account.Parsed['smartContract']

const SmartContract = () => {
  const [t] = useTranslation('account')
  const fields = [
    // TODO: enable this later
    // {
    //   label: t('deployTx'),
    //   value: (
    //     <Link href={`/tx/${txHash}`}>
    //       <a title={t('deployTx')}>{txHash}</a>
    //     </Link>
    //   ),
    // },
    {
      label: t('type'),
      value: <Typography variant="body2">{'Smart Contract'}</Typography>,
    },
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
      {fields.map(field => (
        <ListItem key={field.label}>
          <ListItemText primary={field.label} secondary={field.value} />
        </ListItem>
      ))}
    </List>
  )
}

export default SmartContract
