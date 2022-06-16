import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { Tooltip, List, ListItem, ListItemText, ListSubheader, Divider, Typography, Link } from '@mui/material'
import { GraphQLSchema } from 'utils'

const SmartContract: React.FC<{
  deployer: string
  deployTxHash: string
  udt: Pick<GraphQLSchema.Udt, 'id' | 'name'> | null
}> = ({ deployer, deployTxHash, udt }) => {
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
    deployTxHash
      ? {
          label: t('deployTx'),
          value: (
            <Tooltip title={deployTxHash} placement="top">
              <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <NextLink href={`/tx/${deployTxHash}`}>
                  <Link href={`/tx/${deployTxHash}`} underline="none" className="mono-font" color="secondary">
                    {deployTxHash}
                  </Link>
                </NextLink>
              </Typography>
            </Tooltip>
          ),
        }
      : null,
    udt?.id
      ? {
          label: t('token'),
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
