import { addressToScript } from '@nervosnetwork/ckb-sdk-utils'
import { gql } from 'graphql-request'
import { client } from 'utils/graphql'

const searchKeywordQuery = gql`
  query searchKeyword($text: String!) {
    search_keyword(input: { keyword: $text }) {
      type
      id
    }
  }
`

interface Variables {
  text: string
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
  return fetchSearchResult({ text: query })
    .then(async res => {
      if (!res || !res.id) {
        return `/404`
      }
      switch (res.type) {
        case 'BLOCK': {
          return `/block/${res.id}`
        }
        case 'TRANSACTION': {
          return `/tx/${res.id}`
        }
        case 'ACCOUNT': {
          return `/account/${res.id}`
        }
        case 'UDT': {
          return `/token/${res.id}`
        }
        default: {
          return `/404`
        }
      }
    })
    .then(url => `${url}?search=${search}`)
}
