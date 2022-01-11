import { useTranslation } from 'next-i18next'
import { List, ListItem, ListItemText, ListSubheader, Divider, Typography, Link } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import CollapsableScript from 'components/CollapsableScript'
import { scriptToCkbAddress, scriptToHash, API, CKB_EXPLORER_URL, formatInt } from 'utils'

type State = Omit<API.Account.Parsed['user'], 'udtList'>

const User = ({ ethAddr, nonce, ckbLockScript }: State) => {
  const [t] = useTranslation('account')
  let ckbAddr = ''
  try {
    if (ckbLockScript) {
      ckbAddr = scriptToCkbAddress(ckbLockScript as CKBComponents.Script)
    }
  } catch (err) {
    console.warn(err)
  }

  const fields = [
    {
      label: t(`type`),
      value: <Typography variant="body2">User</Typography>,
    },
    {
      label: t('ethAddr'),
      value: (
        <Typography variant="body2" className="mono-font" overflow="hidden" textOverflow="ellipsis">
          {ethAddr || '-'}
        </Typography>
      ),
    },
    { label: t('nonce'), value: <Typography variant="body2">{formatInt(nonce)}</Typography> },
    {
      label: t('depositorCkbAddr'),
      value: ckbAddr ? (
        <Link
          href={`${CKB_EXPLORER_URL}/address/${ckbAddr}`}
          underline="none"
          target="_blank"
          rel="noopener noreferrer"
          display="flex"
          alignItems="center"
          color="secondary"
        >
          <Typography
            sx={{ textTransform: 'none' }}
            variant="body2"
            overflow="hidden"
            textOverflow="ellipsis"
            className="mono-font"
          >
            {ckbAddr}
          </Typography>

          <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
        </Link>
      ) : (
        <Typography variant="body2">-</Typography>
      ),
    },
  ]
  if (ckbLockScript) {
    fields.push({
      label: t('depositorCkbLockHash'),
      value: (
        <Typography variant="body2" className="mono-font" overflow="hidden" textOverflow="ellipsis">
          {scriptToHash(ckbLockScript as CKBComponents.Script)}
        </Typography>
      ),
    })
  }

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

      <ListItem>
        <CollapsableScript script={ckbLockScript} name={t(`depositorCkbLockScript`)} />
      </ListItem>
    </List>
  )
}

export default User
