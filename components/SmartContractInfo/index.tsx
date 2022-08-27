import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { Skeleton } from '@mui/material'
import Tooltip from 'components/Tooltip'
import InfoList from '../InfoList'
import { client, GraphQLSchema } from 'utils'
import NextPageIcon from 'assets/icons/next-page.svg'
import VerifiedIcon from 'assets/icons/check-success.svg'
import SubmittedIcon from 'assets/icons/submit-success.svg'
import { useState } from 'react'
import { gql } from 'graphql-request'
import styles from './styles.module.scss'

const CONTRACT_FORM_URL = `https://github.com/Magickbase/godwoken_explorer/issues/new/choose`

const verifyAndUpdateFromSourcify = gql`
  mutation verifyAndUpdateFromSourcify($address: HashAddress!) {
    verify_and_update_from_sourcify(input: { address: $address }) {
      abi
    }
  }
`

const verifyAndCheckSourcify = (address: string) =>
  client
    .request<{ verify_and_update_from_sourcify: { abi: Array<any> | null } }>(verifyAndUpdateFromSourcify, {
      address: address,
    })
    .then(data => data.verify_and_update_from_sourcify.abi)

const SmartContract: React.FC<{
  deployer: string
  deployTxHash: string
  udt: Pick<GraphQLSchema.Udt, 'id' | 'name' | 'official_site' | 'description' | 'icon'> | null
  isVerified: boolean
  address: string
  refetch: () => Promise<void>
}> = ({ deployer, deployTxHash, udt, isVerified, address, refetch }) => {
  const [t] = useTranslation('account')
  const [isCheckAgain, setIsCheckAgain] = useState(false)
  const [isSourcifyCheckLoading, setIsSourcifyCheckLoading] = useState(false)

  const { official_site, description, icon } = udt || {}
  const isSubmitted = official_site || description || icon

  const handleCheckClick = async (e: React.SyntheticEvent) => {
    e.stopPropagation()
    e.preventDefault()
    try {
      setIsSourcifyCheckLoading(true)
      const abi = await verifyAndCheckSourcify(address)
      if (!abi) {
        setIsCheckAgain(true)
        window.open('https://sourcify.dev/#/verifier', '_blank').focus()
        return
      }
      await refetch()
    } catch {
      // ignore
    } finally {
      setIsSourcifyCheckLoading(false)
    }
  }

  const list = [
    {
      field: t('type'),
      content: 'Smart Contract',
    },
    {
      field: t('deployer'),
      content: deployer ? (
        <Tooltip title={deployer} placement="top">
          <span>
            <NextLink href={`/account/${deployer}`}>
              <a className="mono-font">{deployer}</a>
            </NextLink>
          </span>
        </Tooltip>
      ) : (
        <Skeleton animation="wave" />
      ),
    },
    {
      field: t('deployTx'),
      content: deployTxHash ? (
        <Tooltip title={deployTxHash} placement="top">
          <span>
            <NextLink href={`/tx/${deployTxHash}`}>
              <a className="mono-font">{deployTxHash}</a>
            </NextLink>
          </span>
        </Tooltip>
      ) : (
        <Skeleton animation="wave" />
      ),
    },
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
    !isVerified
      ? {
          field: t('verify_status'),
          content: isSourcifyCheckLoading ? (
            <span style={{ color: 'var(--primary-text-color)' }}>{t(`checking`)}</span>
          ) : (
            <a onClick={handleCheckClick} style={{ display: 'flex', alignItems: 'center' }}>
              {isCheckAgain ? t(`verify_again`) : t(`verifyBySourcify`)}{' '}
              <NextPageIcon color="primary" style={{ marginLeft: 4, scale: '0.85' }} />
            </a>
          ),
        }
      : null,
    !isSubmitted
      ? {
          field: t('submit_info'),
          content: (
            <a
              href={CONTRACT_FORM_URL}
              target="_blank"
              rel="noreferrer noopener"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {t(`register`)} <NextPageIcon color="primary" style={{ marginLeft: 4, scale: '0.85' }} />
            </a>
          ),
        }
      : null,
  ]

  const TitleWithIcons = () => {
    return (
      <div className={styles.title}>
        <span>{t(`basicInfo`)}</span>
        <div>
          {isVerified ? (
            <Tooltip title={t('verified')} placement="top" key="verified">
              <a href="https://sourcify.dev/#/lookup" target="_blank" rel="noopener noreferrer">
                <VerifiedIcon />
              </a>
            </Tooltip>
          ) : null}
          {isSubmitted ? (
            <Tooltip title={t('submitted')} placement="top" key="submitted">
              <div>
                <SubmittedIcon />
              </div>
            </Tooltip>
          ) : null}
        </div>
      </div>
    )
  }

  return <InfoList title={<TitleWithIcons />} list={list} />
}

export default SmartContract
