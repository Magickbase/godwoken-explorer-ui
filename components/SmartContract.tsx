import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { List, ListItem, ListItemText, ListSubheader, Divider, Typography } from '@mui/material'
import { API } from 'utils'
import UdtList from 'components/UdtList'

type State = API.Account.Parsed['smartContract']

const SmartContract = ({ txHash, ethAddr, udtList }: State) => {
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
    {
      label: t(`ethAddr`),
      value: (
        <Typography variant="body2" overflow="hidden" textOverflow="ellipsis" className="mono-font">
          {ethAddr}
        </Typography>
      ),
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
