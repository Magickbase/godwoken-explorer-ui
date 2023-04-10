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
const searchBitAccountQuery = gql`
  query ($text: String!) {
    search_bit_alias(input: { bit_alias: $text })
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

type SearchBitAccountProps = {
  search_bit_alias: string | null
}

const fetchSearchResult = (variables: Variables): Promise<SearchKeywordProps['search_keyword']> =>
  client
    .request<SearchKeywordProps>(searchKeywordQuery, variables)
    .then(data => data.search_keyword)
    .catch(() => ({ type: null, id: null }))

const fetchSearchResultOfBit = (variables: Variables): Promise<SearchBitAccountProps['search_bit_alias']> =>
  client
    .request<SearchBitAccountProps>(searchBitAccountQuery, variables)
    .then(data => data.search_bit_alias)
    .catch(() => '')

export const fetchSearchKeyword = async (search: string) => {
  let query = search
  let searchResult

  if (query.startsWith('ck')) {
    try {
      const script = addressToScript(query)
      query = `${script.codeHash}_${script.hashType}_${script.args}`
    } catch (err) {
      console.warn(err)
    }
  }
  if (query.endsWith('.bit')) {
    const bitAccount = await fetchSearchResultOfBit({ text: query })
    searchResult = {
      type: 'ACCOUNT',
      id: bitAccount,
    }
  } else {
    searchResult = await fetchSearchResult({ text: query })
  }

  const handleResult = res => {
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
      case 'ADDRESS': {
        return `/account/${res.id}`
      }
      case 'UDT': {
        return `/token/${res.id}`
      }
      default: {
        return `/404`
      }
    }
  }
  const url = handleResult(searchResult)

  return `${url}?search=${search}`
}
