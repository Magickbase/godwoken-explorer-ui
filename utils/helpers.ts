import { utils, providers } from 'ethers'
import { NODE_URL, PCKB_UDT_INFO, ZERO_ADDRESS, IS_MAINNET } from './constants'
import { Chain, configureChains, createClient, defaultChains } from 'wagmi'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { GraphQLSchema } from './graphql'

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

export const mainnet: Chain = {
  id: 71_402,
  name: 'Godwoken Mainnet v1',
  network: '0x116ea',
  nativeCurrency: {
    name: 'pCKB',
    decimals: PCKB_UDT_INFO.decimal,
    symbol: PCKB_UDT_INFO.symbol,
  },
  rpcUrls: {
    default: 'https://v1.mainnet.godwoken.io/rpc',
  },
  blockExplorers: {
    default: { name: 'Godwoken', url: 'https://v1.gwscan.com' },
  },
  testnet: false,
}

export const testnet: Chain = {
  id: 71_401,
  name: 'Godwoken Testnet v1',
  network: '0x116e9',
  nativeCurrency: {
    name: 'pCKB',
    decimals: PCKB_UDT_INFO.decimal,
    symbol: PCKB_UDT_INFO.symbol,
  },
  rpcUrls: {
    default: 'https://godwoken-testnet-v1.ckbapp.dev',
  },
  blockExplorers: {
    default: { name: 'Godwoken', url: 'https://v1.testnet.gwscan.com' },
  },
  testnet: true,
}

export const currentChain = IS_MAINNET ? mainnet : testnet

// wagmi config chains
const { chains, provider: wagmiProvider } = configureChains(
  [mainnet, testnet, ...defaultChains],
  [
    jsonRpcProvider({
      rpc: chain => {
        return { http: chain.rpcUrls.default }
      },
    }),
  ],
)

// wagmi client
export const wagmiClient = createClient({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  provider: wagmiProvider,
})
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
