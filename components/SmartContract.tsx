import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import Tooltip from 'components/Tooltip'
import InfoList from './InfoList'
import { client, GraphQLSchema } from 'utils'
import NextPageIcon from 'assets/icons/next-page.svg'
import VerifiedIcon from 'assets/icons/check-success.svg'
import SubmittedIcon from 'assets/icons/submit-success.svg'
import { Skeleton } from '@mui/material'
import { useState } from 'react'
import { gql } from 'graphql-request'

const CONTRACT_FORM_URL = `https://github.com/Magickbase/godwoken_explorer/issues/new/choose`

const verifyAndUpdateFromSourcify = gql`
  mutation verifyAndUpdateFromSourcify($address: HashAddress!) {
    verify_and_update_from_sourcify(input: { address: $address }) {
      account_id
    }
  }
`

export const recheckVerifyStatus = (address: string) =>
  client
    .request<{ verify_and_update_from_sourcify: { account_id: string | null } }>(verifyAndUpdateFromSourcify, {
      address: address,
    })
    .then(data => data.verify_and_update_from_sourcify.account_id)

const SmartContract: React.FC<{
  deployer: string
  deployTxHash: string
  udt: Pick<GraphQLSchema.Udt, 'id' | 'name'> | null
  isVerified: boolean
  isSubmitted: boolean
  refetchStatus: any
  address: string
}> = ({ deployer, deployTxHash, udt, isVerified, isSubmitted, refetchStatus, address }) => {
  const [t] = useTranslation('account')
  const [checkAgain, setCheckAgain] = useState(false)
  const [isSourcifyCheckLoading, setIsSourcifyCheckLoading] = useState(false)

  const submmitedInfo = isSubmitted
    ? [
        deployer
          ? {
              field: t('deployer'),
              content: (
                <Tooltip title={deployer} placement="top">
                  <span>
                    <NextLink href={`/account/${deployer}`}>
                      <a className="mono-font">{deployer}</a>
                    </NextLink>
                  </span>
                </Tooltip>
              ),
            }
          : null,
        deployTxHash
          ? {
              field: t('deployTx'),
              content: (
                <Tooltip title={deployTxHash} placement="top">
                  <span>
                    <NextLink href={`/tx/${deployTxHash}`}>
                      <a className="mono-font">{deployTxHash}</a>
                    </NextLink>
                  </span>
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
      ]
    : []

  const list = [
    {
      field: t('type'),
      content: 'Smart Contract',
    },
    ...submmitedInfo,
    !isVerified
      ? {
          field: t('verify_status'),
          content: isSourcifyCheckLoading ? (
            <Skeleton animation="wave" />
          ) : (
            <a
              onClick={async () => {
                try {
                  setIsSourcifyCheckLoading(true)
                  const res = await recheckVerifyStatus(address)
                  if (res) {
                    await refetchStatus()
                  } else {
                    window.open('https://sourcify.dev/#/verifier', '_blank').focus()
                    setCheckAgain(true)
                  }
                  setIsSourcifyCheckLoading(false)
                } catch {
                  // TODO: remove next 2 lines after api has error handling other than 500
                  window.open('https://sourcify.dev/#/verifier', '_blank').focus()
                  setCheckAgain(true)
                  setIsSourcifyCheckLoading(false)
                }
              }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {checkAgain ? t(`verify_again`) : t(`verifyBySourcify`)}{' '}
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

  const icons = [
    isVerified ? (
      <Tooltip title={t('verified')} placement="top" key="verified">
        <div>
          <VerifiedIcon />
        </div>
      </Tooltip>
    ) : null,
    isSubmitted ? (
      <Tooltip title={t('submitted')} placement="top" key="submitted">
        <div>
          <SubmittedIcon />
        </div>
      </Tooltip>
    ) : null,
  ]

  return <InfoList title={t(`basicInfo`)} list={list} titleSuffix={icons} />
}

export default SmartContract
