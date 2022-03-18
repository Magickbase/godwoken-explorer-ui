import { API, SERVER_URL, pretreat } from './utils'
import { PAGE_SIZE } from 'utils/constants'

export const getTokenRes = ({
  data: {
    attributes: { official_site, holder_count, transfer_count, short_address, type_script, script_hash, ...rest },
  },
}: API.Token.Raw): API.Token.Parsed => ({
  officialSite: official_site,
  holderCount: holder_count,
  transferCount: transfer_count,
  shortAddress: short_address,
  scriptHash: script_hash,
  typeScript: {
    args: type_script.args,
    codeHash: type_script.code_hash,
    hashType: type_script.hash_type,
  },
  ...rest,
})

export const fetchToken = (id: string) =>
  fetch(`${SERVER_URL}/udts/${id}`)
    .then(res => pretreat<API.Token.Raw>(res))
    .then(getTokenRes)

export interface RawTokenHolderList {
  page: number
  total_count: number
  results: Array<{
    balance: string
    eth_address: string
    percentage: string
    tx_count: number
  }>
}

export interface ParsedTokenHolderList {
  holders: Array<{
    balance: string
    address: string
    percentage: string
    txCount: number
    rank: number
  }>
  meta: Record<'page' | 'total', number>
}

export const getTokenHolderListRes = (res: RawTokenHolderList, pageSize: number): ParsedTokenHolderList => ({
  holders: res.results.map((h, i) => ({
    balance: h.balance,
    address: h.eth_address,
    percentage: h.percentage,
    txCount: h.tx_count,
    rank: pageSize * (res.page - 1) + i + 1,
  })),
  meta: {
    page: res.page,
    total: res.total_count,
  },
})

export const fetchTokenHolderList = (query: {
  udt_id: string
  page?: string
  page_size?: string
}): Promise<ParsedTokenHolderList> =>
  fetch(`${SERVER_URL}/account_udts?${new URLSearchParams({ ...query, page: query.page || '1' })}`)
    .then(res => pretreat<RawTokenHolderList>(res))
    .then(res => getTokenHolderListRes(res, +(query.page_size || PAGE_SIZE)))
