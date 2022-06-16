import type { Udt as UdtProps } from './AccountOverview'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { Link, List, ListItem, ListItemText, ListSubheader, Divider, Typography } from '@mui/material'
import CollapsableScript from './CollapsableScript'

interface SudtProps extends Pick<UdtProps, 'udt' | 'script'> {
  script_hash: string
}

const SUDT = ({ udt, script, script_hash }: SudtProps) => {
  const [t] = useTranslation('account')

  const fields = [
    { label: t(`type`), value: <Typography variant="body2">{`sUDT`}</Typography> },
    {
      label: t('name'),
      value: (
        <Typography variant="body2">
          <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <NextLink href={`/token/${udt.id}`}>
              <Link href={`/token/${udt.id}`} underline="none" className="mono-font" color="secondary">
                {udt.name ?? '-'}
              </Link>
            </NextLink>
          </Typography>
        </Typography>
      ),
    },
    {
      label: t('symbol'),
      value: <Typography variant="body2">{udt.symbol}</Typography>,
    },
    { label: t('decimal'), value: <Typography variant="body2">{udt.decimal}</Typography> },
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
      {script ? (
        <>
          <ListItem>
            <ListItemText
              primary={t(`l2ScriptHash`)}
              secondary={
                <Typography variant="body2" overflow="hidden" textOverflow="ellipsis" className="mono-font">
                  {script_hash}
                </Typography>
              }
            />
          </ListItem>
          <ListItem>
            <CollapsableScript script={script} name={t(`l2Script`)} />
          </ListItem>
        </>
      ) : null}
    </List>
  )
}

export default SUDT
