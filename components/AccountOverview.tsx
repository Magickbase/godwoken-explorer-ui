import { gql } from 'graphql-request'
import { useTranslation } from 'next-i18next'
import BigNumber from 'bignumber.js'
import { Paper, List, ListItem, ListItemText, Divider, Grid, ListSubheader, Typography } from '@mui/material'
import User from 'components/User'
import EthAddrReg from './EthAddrReg'
import MetaContract from 'components/MetaContract'
import SmartContract from 'components/SmartContract'
import Polyjuice from 'components/Polyjuice'
import SUDT from 'components/SUDT'
import UnknownAccount from 'components/UnknownAccount'
import { GCKB_DECIMAL, GraphQLSchema, client } from 'utils'

export type BasicScript = Record<'args' | 'code_hash' | 'hash_type', string>
interface AccountBase {
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
  balance: string
  deployerAddr?: string
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
const accountBalanceQuery = gql`
  query ($address_hashes: [String], $script_hashes: [String]) {
    account_ckbs(input: { address_hashes: $address_hashes, script_hashes: $script_hashes }) {
      balance
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

type Variables = { address: string } | { script_hash: string }

export const fetchAccountOverview = (variables: Variables) =>
  client.request<Omit<AccountOverviewProps, 'balance'>>(accountOverviewQuery, variables).then(
    data =>
      data.account ??
      ({
        type: GraphQLSchema.AccountType.Unknown,
        eth_address: variables['eth_address'] ?? null,
        script_hash: variables['script_hash'] ?? '',
        transaction_count: 0,
        nonce: 0,
      } as UnknownUser),
  )

export const fetchAccountBalance = (variables: { address_hashes: Array<string> } | { script_hashes: Array<string> }) =>
  client
    .request<{ account_ckbs: Array<{ balance: string }> }>(accountBalanceQuery, variables)
    .then(data => data.account_ckbs[0]?.balance ?? '0')

export const fetchDeployAddress = (variables: { eth_hash: string }) =>
  client
    .request<{ transaction: { from_account: Pick<GraphQLSchema.Account, 'eth_address'> } }>(deployAddrQuery, variables)
    .then(data => data.transaction.from_account.eth_address)

const AccountOverview: React.FC<AccountOverviewProps> = ({ account, balance, deployerAddr }) => {
  const [t] = useTranslation(['account', 'common'])
  return (
    <Paper>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <List
            subheader={
              <ListSubheader component="div" sx={{ textTransform: 'capitalize', bgcolor: 'transparent' }}>
                {t(`overview`)}
              </ListSubheader>
            }
            sx={{ textTransform: 'capitalize' }}
          >
            <Divider variant="middle" />
            <ListItem>
              <ListItemText
                primary={t(`ckbBalance`)}
                secondary={
                  <Typography variant="body2">
                    {new BigNumber(balance || '0').dividedBy(GCKB_DECIMAL).toFormat() + ' CKB'}
                  </Typography>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t(`txCount`)}
                secondary={
                  <Typography variant="body2">{new BigNumber(account.transaction_count ?? 0).toFormat()}</Typography>
                }
              />
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={12} md={6}>
          {account.type === GraphQLSchema.AccountType.MetaContract ? (
            <MetaContract {...(account.script as MetaContract['script'])} />
          ) : null}
          {account.type === GraphQLSchema.AccountType.EthUser ? <User nonce={account.nonce} /> : null}
          {account.type === GraphQLSchema.AccountType.EthAddrReg ? <EthAddrReg /> : null}
          {account.type === GraphQLSchema.AccountType.PolyjuiceContract ? (
            <SmartContract
              deployer={deployerAddr}
              deployTxHash={account.smart_contract?.deployment_tx_hash}
              udt={account.udt}
            />
          ) : null}
          {account.type === GraphQLSchema.AccountType.PolyjuiceCreator ? (
            <Polyjuice script={account.script as PolyjuiceCreator['script']} scriptHash={account.script_hash} />
          ) : null}
          {account.type === GraphQLSchema.AccountType.Udt && account.udt ? (
            <SUDT udt={account.udt} script={account.script} script_hash={account.script_hash} />
          ) : null}
          {account.type === GraphQLSchema.AccountType.Unknown ? <UnknownAccount nonce={account.nonce} /> : null}
        </Grid>
      </Grid>
    </Paper>
  )
}

export default AccountOverview
