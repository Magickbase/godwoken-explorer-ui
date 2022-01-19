import type { API } from 'utils/api/utils'
import { useTranslation } from 'next-i18next'
import { List, ListSubheader, ListItem, ListItemText, Divider, Typography } from '@mui/material'
import CollapsableScript from 'components/CollapsableScript'

type State = API.Account.Parsed['polyjuice']

const Polyjuice = ({ script, scriptHash }: State) => {
  const [t] = useTranslation('account')
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
      <ListItem>
        <ListItemText primary={t(`type`)} secondary={<Typography variant="body2">{'Polyjuice'}</Typography>} />
      </ListItem>
      <ListItem>
        <ListItemText
          primary={t(`l2ScriptHash`)}
          secondary={
            <Typography variant="body2" overflow="hidden" textOverflow="ellipsis" className="mono-font">
              {scriptHash}
            </Typography>
          }
        />
      </ListItem>
      <ListItem>
        <CollapsableScript script={script} name={t(`script`)} />
      </ListItem>
    </List>
  )
}

export default Polyjuice
