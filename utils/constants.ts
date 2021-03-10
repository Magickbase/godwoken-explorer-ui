export const EXPLORER_TITLE = process.env.NEXT_PUBLIC_EXPLORER_TITLE
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL
export const IS_MAINNET = process.env.NEXT_PUBLIC_CHAIN_TYPE === 'mainnet'
export const CKB_EXPLORER_URL = `${process.env.NEXT_PUBLIC_CKB_EXPLORER_URL}${IS_MAINNET ? '' : '/aggron'}`
export const NERVINA_WEBSITE_URL = process.env.NEXT_PUBLIC_NERVINA_WEBSITE_URL
export const NERVINA_GITHUB_URL = process.env.NEXT_PUBLIC_NERVINA_GITHUB_URL
export const NERVOS_FOUNDATION_URL = process.env.NEXT_PUBLIC_NERVOS_FOUNDATION_URL

export const IMG_URL = '/icons/'
export const PAGE_SIZE = 10
export const SEARCH_FIELDS = 'block hash/tx hash/account id/lockhash/CKB address/ETH address'
export const WS_ENDPOINT = 'ws://localhost:4000/socket' // TODO: read it from env

export enum CHANNEL {
  HOME = 'channel:home',
}
