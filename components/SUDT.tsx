import { useTranslation } from 'next-i18next'
import { List, ListItem, ListItemText, ListSubheader, Divider, Typography, Avatar } from '@mui/material'
import { scriptToHash, API, nameToColor, formatInt } from 'utils'
import CollapsableScript from './CollapsableScript'

type State = API.Account.Parsed['sudt']

const SUDT = ({ name, symbol, decimal, supply, holders, icon, typeScript, scriptHash }: State) => {
  const [t] = useTranslation('account')

  const fields = [
    { label: t(`type`), value: <Typography variant="body2">{`sUDT`}</Typography> },
    { label: t('name'), value: <Typography variant="body2">{name}</Typography> },
    {
      label: t('symbol'),
      value: <Typography variant="body2">{symbol}</Typography>,
    },
    { label: t('decimal'), value: <Typography variant="body2">{decimal}</Typography> },
    { label: t('l2Supply'), value: <Typography variant="body2">{formatInt(supply)}</Typography> },
    {
      label: t('holders'),
      value: <Typography variant="body2">{formatInt(holders)}</Typography>,
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
      {typeScript ? (
        <>
          <ListItem>
            <ListItemText
              primary={t(`l1TypeHash`)}
              secondary={
                <Typography variant="body2" overflow="hidden" textOverflow="ellipsis" className="mono-font">
                  {scriptToHash(typeScript as CKBComponents.Script)}
                </Typography>
              }
            />
          </ListItem>
          <ListItem>
            <CollapsableScript script={typeScript} name={t(`l1TypeScript`)} />
          </ListItem>
        </>
      ) : null}
      {scriptHash ? (
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
      ) : null}
    </List>
  )
}

export default SUDT
