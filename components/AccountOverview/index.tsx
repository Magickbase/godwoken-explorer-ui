import { gql } from 'graphql-request'
import { useTranslation } from 'next-i18next'
import BigNumber from 'bignumber.js'
import { Skeleton } from '@mui/material'
import User from 'components/User'
import EthAddrReg from 'components/EthAddrReg'
import MetaContract from 'components/MetaContract'
import SmartContract from 'components/SmartContract'
import Polyjuice from 'components/Polyjuice'
import SUDT from 'components/SUDT'
import UnknownAccount from 'components/UnknownAccount'
import InfoList from 'components/InfoList'
import Amount from 'components/Amount'
import styles from './styles.module.scss'
import { GraphQLSchema, client, provider, PCKB_UDT_INFO } from 'utils'
import { useQuery } from 'react-query'

export type BasicScript = Record<'args' | 'code_hash' | 'hash_type', string>
export interface AccountBase {
  eth_address: string | null
  script_hash: string
  transaction_count: number
  nonce: number
}

interface UnknownUser extends AccountBase {
  type: GraphQLSchema.AccountType.Unknown
}

interface EthUser extends AccountBase {
  type: GraphQLSchema.AccountType.EthUser
  script: BasicScript
}
interface EthAddrReg extends AccountBase {
  type: GraphQLSchema.AccountType.EthAddrReg
  script: BasicScript
}
export interface PolyjuiceContract extends AccountBase {
  type: GraphQLSchema.AccountType.PolyjuiceContract
  script: BasicScript
  smart_contract: Pick<
    GraphQLSchema.SmartContract,
    | 'deployment_tx_hash'
    | 'name'
    | 'compiler_version'
    | 'compiler_file_format'
    | 'contract_source_code'
    | 'abi'
    | 'constructor_arguments'
  > | null
  udt: Pick<GraphQLSchema.Udt, 'id' | 'name' | 'decimal' | 'symbol'> | null
}
export interface PolyjuiceCreator extends AccountBase {
  type: GraphQLSchema.AccountType.PolyjuiceCreator
  script: BasicScript
}

export interface Udt extends AccountBase {
  type: GraphQLSchema.AccountType.Udt
  script: BasicScript
  udt: Pick<GraphQLSchema.Udt, 'id' | 'name' | 'decimal' | 'symbol'> | null
}

export interface MetaContract extends AccountBase {
  type: GraphQLSchema.AccountType.MetaContract
  script: BasicScript & {
    account_merkle_state: {
      account_count: number
      account_merkle_root: string
    }
    block_merkle_state: {
      block_count: number
      block_merkle_root: string
    }
    last_finalized_block_number: number
    reverted_block_root: string
    status: 'running' | 'halting'
  }
}

export type AccountOverviewProps = {
  account: EthUser | EthAddrReg | PolyjuiceCreator | PolyjuiceContract | Udt | MetaContract | UnknownUser
  isOverviewLoading?: boolean
  isBalanceLoading?: boolean
  balance: string
  deployerAddr?: string
  isContractVerified?: boolean
}

const accountOverviewQuery = gql`
  query ($script_hash: String, $address: String) {
    account(input: { script_hash: $script_hash, address: $address }) {
      type
      eth_address
      script_hash
      script
      transaction_count
      nonce
      udt {
        id
        name
        decimal
        symbol
      }
      smart_contract {
        name
        deployment_tx_hash
        compiler_version
        compiler_file_format
        contract_source_code
        constructor_arguments
        abi
      }
    }
  }
`

const deployAddrQuery = gql`
  query ($eth_hash: String!) {
    transaction(input: { eth_hash: $eth_hash }) {
      from_account {
        eth_address
      }
    }
  }
`

const checkSourcify = gql`
  query checkSourcify($address: String!) {
    sourcify_check_by_addresses(input: { addresses: [$address] }) {
      address
      chain_ids
      status
    }
  }
`

type Variables = { address: string } | { script_hash: string }

export const fetchAccountOverview = (variables: Variables) =>
  client.request<Omit<AccountOverviewProps, 'balance'>>(accountOverviewQuery, variables).then(
    data =>
      data.account ??
      ({
        type: GraphQLSchema.AccountType.Unknown,
        eth_address: variables['address'] ?? null,
        script_hash: variables['script_hash'] ?? '',
        transaction_count: 0,
        nonce: 0,
      } as UnknownUser),
  )

export const fetchAccountBalance = (address: string) => provider.getBalance(address).then(res => res.toString())

export const fetchDeployAddress = (variables: { eth_hash: string }) =>
  client
    .request<{ transaction: { from_account: Pick<GraphQLSchema.Account, 'eth_address'> } }>(deployAddrQuery, variables)
    .then(data => data.transaction.from_account.eth_address)

export const fetchSourcifyStatus = (address: string) =>
  client
    .request<{ sourcify_check_by_addresses: { status: string | null } }>(checkSourcify, { address })
    .then(data => data.sourcify_check_by_addresses.status)

const overviewPlaceHolderCount = (account: AccountOverviewProps['account']) => {
  switch (account.type) {
    case GraphQLSchema.AccountType.EthUser:
      return 0
    case GraphQLSchema.AccountType.PolyjuiceCreator:
      return 1
    case GraphQLSchema.AccountType.PolyjuiceContract:
      if (!!account.smart_contract?.deployment_tx_hash) {
        return 2
      } else {
        return 1
      }
    case GraphQLSchema.AccountType.MetaContract:
      return 6
    case GraphQLSchema.AccountType.EthAddrReg:
      return 0
    case GraphQLSchema.AccountType.Udt:
      return 4
  }
}

const AccountOverview: React.FC<AccountOverviewProps> = ({
  account,
  balance,
  deployerAddr,
  isBalanceLoading,
  isOverviewLoading,
}) => {
  const [t] = useTranslation(['account', 'common'])

  const {
    isLoading: isSourcifyCheckLoading,
    data: verifyStatus,
    refetch: refetchStatus,
  } = useQuery(['sourcify-check', account.eth_address], () => fetchSourcifyStatus(account.eth_address), {
    retry: false,
  })

  return (
    <div className={styles.container} data-account-type={account.type}>
      {account.type === GraphQLSchema.AccountType.MetaContract ? (
        <MetaContract {...(account.script as MetaContract['script'])} />
      ) : null}
      {account.type === GraphQLSchema.AccountType.EthUser ? (
        <User nonce={account.nonce} isLoading={isOverviewLoading} />
      ) : null}
      {account.type === GraphQLSchema.AccountType.EthAddrReg ? <EthAddrReg /> : null}
      {account.type === GraphQLSchema.AccountType.PolyjuiceContract ? (
        <SmartContract
          deployer={deployerAddr}
          deployTxHash={account.smart_contract?.deployment_tx_hash}
          udt={account.udt}
          address={account.eth_address}
          isSourcifyCheckLoading={isSourcifyCheckLoading}
          isVerified={verifyStatus === 'perfect'}
          isSubmitted={!!account.smart_contract?.deployment_tx_hash}
          refetchStatus={refetchStatus}
        />
      ) : null}
      {account.type === GraphQLSchema.AccountType.PolyjuiceCreator ? (
        <Polyjuice script={account.script as PolyjuiceCreator['script']} scriptHash={account.script_hash} />
      ) : null}
      {account.type === GraphQLSchema.AccountType.Udt && account.udt ? (
        <SUDT udt={account.udt} script={account.script} script_hash={account.script_hash} />
      ) : null}
      {account.type === GraphQLSchema.AccountType.Unknown ? <UnknownAccount nonce={account.nonce} /> : null}

      <InfoList
        title={t('overview')}
        list={[
          {
            field: t(`ckbBalance`),
            content: isBalanceLoading ? (
              <Skeleton animation="wave" />
            ) : (
              <span className={styles.balance}>
                <Amount amount={balance || '0'} udt={PCKB_UDT_INFO} showSymbol />
              </span>
            ),
          },
          {
            field: t(`txCount`),
            content: isOverviewLoading ? (
              <Skeleton animation="wave" />
            ) : (
              new BigNumber(Math.max(account.nonce ?? 0, account.transaction_count ?? 0)).toFormat()
            ),
          },
          overviewPlaceHolderCount(account)
            ? {
                field: '',
                content: (
                  <div
                    data-role="placeholder"
                    style={{ height: `calc(${3.5 * overviewPlaceHolderCount(account)}rem - 2rem)` }}
                  ></div>
                ),
              }
            : null,
          // ...overviewPlaceHolderFields,
        ]}
      />
    </div>
  )
}

export default AccountOverview
