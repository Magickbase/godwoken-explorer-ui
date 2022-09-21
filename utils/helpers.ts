import { utils, providers } from 'ethers'
import { GraphQLSchema } from './graphql'
import { NODE_URL, ZERO_ADDRESS } from './constants'

export const isEthAddress = (hash: string) => {
  try {
    if (utils.getAddress(hash)) {
      return true
    }
  } catch {
    // ignore
  }
  return false
}

export const provider = new providers.JsonRpcProvider(NODE_URL)

export const parseTokenName = (name: string) => {
  const parsed = name?.split(/\(via|from/) ?? []
  return {
    name: parsed[0]?.trim() ?? '',
    bridge: parsed[1]?.trim() ?? '',
    origin: parsed[2]?.trim().slice(0, -1) ?? '',
  }
}

// TODO: add tests after cypress is enabled
export const getAddressDisplay = (
  account?: Pick<GraphQLSchema.Account, 'smart_contract' | 'eth_address' | 'script_hash' | 'type'>,
  nativeTransferAddress?: string,
): {
  label: string
  address: string | null
} => {
  if (nativeTransferAddress) {
    return {
      label: nativeTransferAddress === ZERO_ADDRESS ? 'zero address' : nativeTransferAddress,
      address: nativeTransferAddress,
    }
  }

  if (account?.smart_contract?.name) {
    return {
      label: `${account.smart_contract.name} (${account.eth_address})`,
      address: account.eth_address,
    }
  }

  if (
    [
      GraphQLSchema.AccountType.EthAddrReg,
      GraphQLSchema.AccountType.MetaContract,
      GraphQLSchema.AccountType.PolyjuiceCreator,
      GraphQLSchema.AccountType.Udt,
    ].includes(account?.type)
  ) {
    return {
      label: account.type.replace(/_/g, ' ').toLowerCase(),
      address: account.script_hash,
    }
  }

  return {
    label: account?.eth_address === ZERO_ADDRESS ? 'zero address' : account?.eth_address || '-',
    address: account?.eth_address || null,
  }
}
