import { utils, providers } from 'ethers'
import { NODE_URL, PCKB_UDT_INFO } from './constants'
import { TxStatus } from './api/tx'
import { GraphQLSchema } from './graphql'
import { Chain, configureChains, createClient } from 'wagmi'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

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

export const getBlockStatus = (status: GraphQLSchema.BlockStatus | null): TxStatus => {
  switch (status) {
    case GraphQLSchema.BlockStatus.Committed: {
      return 'committed'
    }
    case GraphQLSchema.BlockStatus.Finalized: {
      return 'finalized'
    }
    default: {
      return 'pending'
    }
  }
}

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

// wagmi config chains
const { chains, provider: wagmiProvider } = configureChains(
  [mainnet, testnet],
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
