import { useTranslation } from 'next-i18next'
import { List, ListItem, ListItemText, ListSubheader, Divider, Typography } from '@mui/material'
import { formatInt } from 'utils'
import type { API } from 'utils/api/utils'

type State = Omit<API.Account.Parsed['user'], 'udtList'>

const User = ({ nonce }: State) => {
  const [t] = useTranslation('account')

  const fields = [
    {
      label: t(`type`),
      value: <Typography variant="body2">User</Typography>,
    },
    { label: t('nonce'), value: <Typography variant="body2">{formatInt(nonce)}</Typography> },
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
          <ListItemText primary={field.label} secondary={field.value} />
        </ListItem>
      ))}
    </List>
  )
}

export default User
