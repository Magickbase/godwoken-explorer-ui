import { addressToScript } from '@nervosnetwork/ckb-sdk-utils'
import { gql } from 'graphql-request'
import { client } from 'utils/graphql'
import { isError, ErrorResponse, API_ENDPOINT, HttpStatus } from './utils'

const searchKeywordQuery = gql`
  query searchKeyword($input: String!) {
    search_keyword(input: { keyword: "%MSHKUUPS%" }) {
      type
      id
    }
  }
`

interface Variables {
  input: {
    keyword: string
  }
}

type SearchKeywordProps = {
  search_keyword: {
    type: string | null
    id: string | null
  }
}

const fetchSearchResult = (variables: Variables): Promise<SearchKeywordProps['search_keyword']> =>
  client
    .request<SearchKeywordProps>(searchKeywordQuery, variables)
    .then(data => data.search_keyword)
    .catch(() => ({ type: null, id: null }))

export const fetchSearchKeyword = (search: string) => {
  let query = search
  if (query.startsWith('ck')) {
    try {
      const script = addressToScript(query)
      query = `${script.codeHash}_${script.hashType}_${script.args}`
    } catch (err) {
      console.warn(err)
    }
  }
  return fetchSearchResult({ input: { keyword: query } })
    .then(async res => {
      if (!res || !res.id) {
        return `/404`
      }
      switch (res.type) {
        case 'block': {
          return `/block/${res.id}`
        }
        case 'transaction': {
          return `/tx/${res.id}`
        }
        case 'account': {
          return `/account/${res.id}`
        }
        case 'udt': {
          return `/token/${res.id}`
        }
        default: {
          return `/404`
        }
      }
    })
    .then(url => `${url}?search=${search}`)
}
