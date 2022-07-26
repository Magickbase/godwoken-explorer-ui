import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { Tooltip, Typography, Link } from '@mui/material'
import InfoList from './InfoList'
import { AddModeratorOutlined as RegisterIcon } from '@mui/icons-material'
import { GraphQLSchema } from 'utils'

const CONTRACT_FORM_URL = `https://github.com/Magickbase/godwoken_explorer/issues/new/choose`

const SmartContract: React.FC<{
  deployer: string
  deployTxHash: string
  udt: Pick<GraphQLSchema.Udt, 'id' | 'name'> | null
  isVerified: boolean
}> = ({ deployer, deployTxHash, udt, isVerified }) => {
  const [t] = useTranslation('account')
  const list = [
    {
      field: t('type'),
      content: <Typography variant="body2">{'Smart Contract'}</Typography>,
    },
    deployer
      ? {
          field: t('deployer'),
          content: (
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
          field: t('deployTx'),
          content: (
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
          field: t('token'),
          content: (
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
    {
      field: t('verify_status'),
      content: isVerified ? (
        <Typography variant="body2">{t(`verified`)}</Typography>
      ) : (
        <Typography variant="body2">
          <Link
            href={CONTRACT_FORM_URL}
            target="_blank"
            rel="noreferrer noopener"
            display="flex"
            alignItems="center"
            underline="none"
            color="secondary"
          >
            {t(`unverified`)} <RegisterIcon fontSize="small" />
          </Link>
        </Typography>
      ),
    },
  ]

  return <InfoList title={t(`basicInfo`)} list={list} />
}

export default SmartContract
