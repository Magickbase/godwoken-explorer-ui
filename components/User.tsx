import { useTranslation } from 'next-i18next'
import { List, ListItem, ListItemText, ListSubheader, Divider, Typography, Skeleton } from '@mui/material'

const User = ({ nonce, isLoading }: { nonce: number; isLoading: boolean }) => {
  const [t] = useTranslation('account')

  const fields = [
    {
      label: t(`type`),
      value: <Typography variant="body2">User</Typography>,
    },
    {
      label: t('nonce'),
      value: isLoading ? (
        <Skeleton animation="wave" />
      ) : (
        <Typography variant="body2">{nonce.toLocaleString('en')}</Typography>
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
          <ListItemText primary={field.label} secondary={field.value} />
        </ListItem>
      ))}
    </List>
  )
}

export default User
