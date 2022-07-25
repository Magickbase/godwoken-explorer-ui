import BigNumber from 'bignumber.js'

if (!process.env.NEXT_PUBLIC_SERVER_ENDPOINT) {
  throw new Error(`Server endpoint required`)
}

export const API_ENDPOINT = `https://${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api`
export const WS_ENDPOINT = `wss://${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/socket`
export const GRAPHQL_ENDPOINT = `https://${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/graphql`
export const NODE_URL = process.env.NEXT_PUBLIC_NODE_URL

export const EXPLORER_TITLE = process.env.NEXT_PUBLIC_EXPLORER_TITLE
export const IS_MAINNET = process.env.NEXT_PUBLIC_CHAIN_TYPE === 'mainnet'
export const CKB_EXPLORER_URL = `https://${IS_MAINNET ? '' : 'pudge.'}${process.env.NEXT_PUBLIC_CKB_EXPLORER_URL}`
export const NERVINA_GITHUB_URL = process.env.NEXT_PUBLIC_NERVINA_GITHUB_URL
export const NERVOS_URL = process.env.NEXT_PUBLIC_NERVOS_URL

export const IMG_URL = '/icons/'
export const PAGE_SIZE = 20
export const CKB_DECIMAL = new BigNumber(10 ** 8)
export const GCKB_DECIMAL = new BigNumber(10 ** 18)
export const PCKB_UAN = 'pCKB.gw|gb.ckb'
export const PCKB_SYMBOL = 'pCKB'
export const SEARCH_FIELDS = 'block hash/txn hash/lockhash/ETH address/token name/token symbol'
export const MAINNET_HOSTNAME = process.env.NEXT_PUBLIC_MAINNET_EXPLORER_HOSTNAME
export const TESTNET_HOSTNAME = process.env.NEXT_PUBLIC_TESTNET_EXPLORER_HOSTNAME

export enum CHANNEL {
  HOME = 'home:refresh',
  BLOCK_INFO = 'blocks:',
  TX_INFO = 'transactions:',
  ACCOUNT_INFO = 'accounts:',
  ACCOUNT_TX_LIST = 'account_transactions:',
}
