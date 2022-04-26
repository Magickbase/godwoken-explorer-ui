import { API, SERVER_URL, pretreat } from './utils'

export const getTokenListRes = (tokenListRes: API.Tokens.Raw): API.Tokens.Parsed => ({
  meta: {
    current: tokenListRes.meta.current_page,
    total: tokenListRes.meta.total_page,
  },
  tokens: tokenListRes.data.map(
    ({
      attributes: {
        official_site,
        script_hash,
        type_script,
        transfer_count,
        short_address,
        eth_address,
        holder_count,
        ...attrs
      },
    }) => ({
      officialSite: official_site,
      scriptHash: script_hash,
      transferCount: transfer_count,
      address: eth_address || short_address || null,
      holderCount: holder_count,
      typeScript: type_script,
      ...attrs,
    }),
  ),
})
export const fetchTokenList = (
  query: Partial<Record<'page' | 'type' | 'account_id', string>>,
): Promise<API.Tokens.Parsed> =>
  fetch(`${SERVER_URL}/udts?${new URLSearchParams({ ...query, page: query.page || '1' })}`)
    .then(res => pretreat<API.Tokens.Raw>(res))
    .then(getTokenListRes)
