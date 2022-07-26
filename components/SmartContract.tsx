import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import Tooltip from 'components/Tooltip'
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
      content: 'Smart Contract',
    },
    deployer
      ? {
          field: t('deployer'),
          content: (
            <Tooltip title={deployer} placement="top">
              <NextLink href={`/account/${deployer}`}>
                <a className="mono-font">{deployer}</a>
              </NextLink>
            </Tooltip>
          ),
        }
      : null,
    deployTxHash
      ? {
          field: t('deployTx'),
          content: (
            <Tooltip title={deployTxHash} placement="top">
              <NextLink href={`/tx/${deployTxHash}`}>
                <a className="mono-font">{deployTxHash}</a>
              </NextLink>
            </Tooltip>
          ),
        }
      : null,
    udt?.id
      ? {
          field: t('token'),
          content: (
            <NextLink href={`/token/${udt.id}`}>
              <a className="mono-font">{udt.name ?? '-'}</a>
            </NextLink>
          ),
        }
      : null,
    {
      field: t('verify_status'),
      content: isVerified ? (
        t(`verified`)
      ) : (
        <a
          href={CONTRACT_FORM_URL}
          target="_blank"
          rel="noreferrer noopener"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {t(`unverified`)} <RegisterIcon fontSize="small" />
        </a>
      ),
    },
  ]

  return <InfoList title={t(`basicInfo`)} list={list} />
}

export default SmartContract
