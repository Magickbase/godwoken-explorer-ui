import { gql } from 'graphql-request'
import { useTranslation } from 'next-i18next'
import BigNumber from 'bignumber.js'
import { Skeleton } from '@mui/material'
import User from 'components/User'
import EthAddrReg from 'components/EthAddrReg'
import MetaContract from 'components/MetaContract'
import SmartContract from 'components/SmartContractInfo'
import Polyjuice from 'components/Polyjuice'
import SUDT from 'components/SUDT'
import UnknownAccount from 'components/UnknownAccount'
import InfoList from 'components/InfoList'
import Amount from 'components/Amount'
import styles from './styles.module.scss'
import { GraphQLSchema, client, provider, PCKB_UDT_INFO } from 'utils'

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
    | 'sourcify_metadata'
    | 'abi'
    | 'constructor_arguments'
  > | null
  udt: Pick<GraphQLSchema.Udt, 'id' | 'name' | 'official_site' | 'description' | 'icon' | 'eth_type'> | null
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
  account: EthUser | EthAddrReg | PolyjuiceCreator | PolyjuiceContract | Udt | MetaContract | UnknownUser | null
  isOverviewLoading?: boolean
  isBalanceLoading?: boolean
  balance: string
  deployer?: Pick<GraphQLSchema.Account, 'eth_address' | 'bit_alias'>
  isContractVerified?: boolean
}

const accountOverviewQuery = gql`
  query ($script_hash: String, $address: String) {
    account(input: { script_hash: $script_hash, address: $address }) {
      ... on Account {
        type
        eth_address
        bit_alias
        script_hash
        script
        transaction_count
        nonce
        udt {
          id
          name
          decimal
          symbol
          description
          official_site
          icon
        }
        smart_contract {
          name
          deployment_tx_hash
          compiler_version
          compiler_file_format
          contract_source_code
          sourcify_metadata
          constructor_arguments
          abi
        }
        udt {
          eth_type
        }
      }
    }
  }
`

const accountOverviewQueryUnion = gql`
  query ($script_hash: String, $address: String) {
    account(input: { script_hash: $script_hash, address: $address }) {
      ... on Account {
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
          description
          official_site
          icon
        }
        smart_contract {
          name
          deployment_tx_hash
          compiler_version
          compiler_file_format
          contract_source_code
          sourcify_metadata
          constructor_arguments
          abi
        }
        udt {
          eth_type
        }
      }
      ... on Address {
        eth_address
        token_transfer_count
        bit_alias
      }
    }
  }
`

const deployAddrQuery = gql`
  query ($eth_hash: String!) {
    transaction(input: { eth_hash: $eth_hash }) {
      from_account {
        eth_address
        bit_alias
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

const fetchAccount = (variables: Variables, fetchApi) =>
  client.request<Omit<AccountOverviewProps, 'balance'>>(fetchApi, variables).then(
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
export const fetchAccountOverview = (variables: Variables) => fetchAccount(variables, accountOverviewQuery)
export const fetchAccountOverviewUnion = (variables: Variables) => fetchAccount(variables, accountOverviewQueryUnion)
export const fetchAccountBalance = (address: string) => provider.getBalance(address).then(res => res.toString())
export const fetchDeployAddress = (variables: { eth_hash: string }) =>
  client
    .request<{ transaction: { from_account: Pick<GraphQLSchema.Account, 'eth_address' | 'bit_alias'> } }>(
      deployAddrQuery,
      variables,
    )
    .then(
      data =>
        data.transaction.from_account ?? {
          eth_address: '',
          bit_alias: '',
        },
    )

type SourcifyStatusResponse = {
  sourcify_check_by_addresses: [{ address: string; chain_ids: string[]; status: string }]
}

export const fetchSourcifyStatus = (address: string) =>
  client.request<SourcifyStatusResponse>(checkSourcify, { address }).then(data => {
    return data.sourcify_check_by_addresses[0].status
  })

const overviewPlaceHolderCount = (account: AccountOverviewProps['account']) => {
  switch (account?.type) {
    case GraphQLSchema.AccountType.EthUser:
      return 0
    case GraphQLSchema.AccountType.PolyjuiceCreator:
      return 1
    case GraphQLSchema.AccountType.PolyjuiceContract:
      let count = 1
      if (account.udt?.id) {
        count++
      }

      if (!account.smart_contract?.contract_source_code) {
        count++
      }

      if (!account.udt?.icon && !account.udt?.description && !account.udt?.official_site) {
        count++
      }
      return count
    case GraphQLSchema.AccountType.MetaContract:
      return 6
    case GraphQLSchema.AccountType.EthAddrReg:
      return 0
    case GraphQLSchema.AccountType.Udt:
      return 4
  }
}

const AccountOverview: React.FC<AccountOverviewProps & { refetch: () => Promise<any> }> = ({
  account,
  balance,
  deployer,
  isBalanceLoading,
  isOverviewLoading,
  refetch,
}) => {
  const [t] = useTranslation(['account', 'common'])

  if (isOverviewLoading) {
    return (
      <div className={styles.container}>
        <InfoList
          title={t('basicInfo')}
          list={[
            {
              field: t('type'),
              content: <Skeleton animation="wave" width="100%" />,
            },
          ]}
        />
        <InfoList
          title={t('overview')}
          list={[
            {
              field: t('ckbBalance'),
              content: <Skeleton animation="wave" />,
            },
          ]}
        />
      </div>
    )
  }

  // Over there, account.type is used to determine whether the data is type of Address.
  // Cause the data of Address only have 3 parameters, `eth_address`,`token_transfer_count` and `bit_alias`
  if (!account?.type) {
    return (
      <div className={styles.container}>
        <InfoList
          title={t('basicInfo')}
          list={[
            {
              field: t('type'),
              content: 'Unknown',
            },
          ]}
        />
        <InfoList
          title={t('overview')}
          list={[
            {
              field: t('ckbBalance'),
              content: 0,
            },
          ]}
        />
      </div>
    )
  }

  const infoList = [
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
  ]

  overviewPlaceHolderCount(account) &&
    infoList.push({
      field: '',
      content: (
        <div
          data-role="placeholder"
          style={{ height: `calc(${3.5 * overviewPlaceHolderCount(account)!}rem - 2rem)` }}
        ></div>
      ),
    })

  const getInfoBlock = account => {
    const { type } = account
    const domain = account?.bit_alias

    const blockMap = {
      [`${GraphQLSchema.AccountType.MetaContract}`]: <MetaContract {...(account.script as MetaContract['script'])} />,
      [`${GraphQLSchema.AccountType.EthUser}`]: (
        <User nonce={account.nonce} isLoading={isOverviewLoading} domain={domain} />
      ),
      [`${GraphQLSchema.AccountType.EthAddrReg}`]: <EthAddrReg />,
      [`${GraphQLSchema.AccountType.PolyjuiceContract}`]: (
        <SmartContract
          deployer={deployer}
          deployTxHash={account.smart_contract?.deployment_tx_hash!}
          udt={account.udt}
          address={account.eth_address || ''}
          isVerified={!!account.smart_contract?.contract_source_code}
          refetch={refetch}
          isLoading={isOverviewLoading}
        />
      ),
      [`${GraphQLSchema.AccountType.PolyjuiceCreator}`]: (
        <Polyjuice script={account.script as PolyjuiceCreator['script']} scriptHash={account.script_hash} />
      ),
      [`${GraphQLSchema.AccountType.Udt}`]: account.udt ? (
        <SUDT udt={account.udt} script={account.script} script_hash={account.script_hash} />
      ) : null,
      [`${GraphQLSchema.AccountType.Unknown}`]: <UnknownAccount nonce={account.nonce} />,
    }
    const infoBlock = blockMap[type]

    return infoBlock ? <div className={`${styles['info-width']}`}>{infoBlock}</div> : null
  }

  return (
    <div className={styles.container} data-account-type={account.type}>
      {getInfoBlock(account)}
      <InfoList title={t('overview')} list={infoList} />
    </div>
  )
}

export default AccountOverview
