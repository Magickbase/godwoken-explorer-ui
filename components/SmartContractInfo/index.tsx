import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { Skeleton } from '@mui/material'
import InfoList from '../InfoList'
import Tooltip from 'components/Tooltip'
import Address from 'components/TruncatedAddress'
import NextPageIcon from 'assets/icons/next-page.svg'
import VerifiedIcon from 'assets/icons/check-success.svg'
import SubmittedIcon from 'assets/icons/submit-success.svg'
import { gql } from 'graphql-request'
import { client, GraphQLSchema } from 'utils'
import styles from './styles.module.scss'
import ResponsiveHash from 'components/ResponsiveHash'

const CONTRACT_FORM_URL = `https://github.com/Magickbase/godwoken_explorer/issues/new/choose`

const tokenSubPath: Record<GraphQLSchema.TokenType, string> = {
  ERC20: 'token',
  ERC721: 'nft-collection',
  ERC1155: 'multi-token-collection',
}

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
  deployer: Pick<GraphQLSchema.Account, 'eth_address' | 'bit_alias'>
  deployTxHash: string
  udt: Pick<GraphQLSchema.Udt, 'id' | 'name' | 'official_site' | 'description' | 'icon' | 'eth_type'> | null
  isVerified: boolean
  address: string
  isLoading: boolean
  refetch: () => Promise<void>
}> = ({ deployer = {}, deployTxHash, udt, isVerified, address, refetch, isLoading }) => {
  const [t] = useTranslation('account')
  const [isCheckAgain, setIsCheckAgain] = useState(false)
  const [isSourcifyCheckLoading, setIsSourcifyCheckLoading] = useState(false)

  const { official_site, description, icon } = udt || {}
  const isSubmitted = official_site || description || icon
  const { eth_address: deployerAddr = '', bit_alias = '' } = deployer

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

  let tokenUrl: string | null = null
  switch (udt?.eth_type) {
    case GraphQLSchema.TokenType.ERC20: {
      tokenUrl = `/token/${udt.id}`
      break
    }
    case GraphQLSchema.TokenType.ERC721: {
      tokenUrl = `/nft-collection/${address}`
      break
    }
    case GraphQLSchema.TokenType.ERC1155: {
      tokenUrl = `/multi-token-collection/${address}`
      break
    }
    default: {
      // ignore
    }
  }

  const list = [
    {
      field: t('type'),
      content: 'Smart Contract',
    },
    {
      field: t('deployer'),
      content: deployerAddr ? (
        bit_alias ? (
          <Address address={deployerAddr} domain={bit_alias} />
        ) : (
          <ResponsiveHash label={deployerAddr} href={`/account/${deployerAddr}`} labelTooltip={deployerAddr} />
        )
      ) : isLoading ? (
        <Skeleton animation="wave" />
      ) : (
        '-'
      ),
      ddClassName: styles['item-dd-cls'],
    },
    {
      field: t('deployTx'),
      content: deployTxHash ? (
        <ResponsiveHash label={deployTxHash} href={`/tx/${deployTxHash}`} labelTooltip={deployTxHash} />
      ) : isLoading ? (
        <Skeleton animation="wave" />
      ) : (
        '-'
      ),
      ddClassName: styles['item-dd-cls'],
    },
    tokenUrl
      ? {
          field: t('token'),
          content: (
            <NextLink href={tokenUrl}>
              <a>{udt?.name ?? '-'}</a>
            </NextLink>
          ),
          ddClassName: styles['item-dd-token'],
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
            <a
              className="tooltip"
              data-tooltip={t('verified')}
              key="verified"
              href="https://sourcify.dev/#/lookup"
              target="_blank"
              rel="noopener noreferrer"
            >
              <VerifiedIcon />
            </a>
          ) : null}
          {isSubmitted ? (
            <div className="tooltip" data-tooltip={t('submitted')} key="submitted">
              <SubmittedIcon />
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  return <InfoList title={<TitleWithIcons />} list={list} />
}

export default SmartContract
