import { addressToScript } from '@nervosnetwork/ckb-sdk-utils'
import { isError, ErrorResponse, SERVER_URL, HttpStatus } from './utils'

export const fetchSearch = (search: string) => {
  let query = search
  if (query.startsWith('ck')) {
    try {
      const script = addressToScript(query)
      query = `${script.codeHash}_${script.hashType}_${script.args}`
    } catch (err) {
      console.warn(err)
    }
  }

  return fetch(`${SERVER_URL}/search?keyword=${query}`)
    .then(async res => {
      if (res.status === HttpStatus.NotFound) {
        return `/404`
      }
      const found: Record<'id' | 'type', string> | ErrorResponse = await res.json()
      if (isError(found)) {
        return `/404`
      }
      switch (found.type) {
        case 'block': {
          return `/block/${found.id}`
        }
        case 'transaction': {
          return `/tx/${found.id}`
        }
        case 'account': {
          return `/account/${found.id}`
        }
        case 'udt': {
          return `/token/${found.id}`
        }
        default: {
          return `/404`
        }
      }
    })
    .then(url => `${url}?search=${search}`)
}
