import { API, SERVER_URL, pretreat } from './utils'

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
