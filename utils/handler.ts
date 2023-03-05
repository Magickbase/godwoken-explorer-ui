import { ServerResponse } from 'http'
import { NotFoundException } from './exceptions'
import { fetchSearchKeyword } from './api'

export const handleApiError = (err: Error, _res: ServerResponse | null, locale: string, query?: string) => {
  // return {
  //   redirect: {
  //     destination: `/notification`,
  //     permanent: false,
  //   },
  // }
  if (err instanceof NotFoundException) {
    return {
      redirect: {
        destination: `/${locale}/404${query ? '?query=' + query : ''}`,
        permanent: false,
      },
    }
  } else {
    console.warn(err.message)
    return {
      redirect: {
        destination: `/error?message=${err.message}`,
        permanent: false,
      },
    }
  }
}

export const handleSearchKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>, push: (url: string) => any) => {
  const { key, target } = e
  const search = (target as HTMLInputElement).value
  if (key !== 'Enter' || !search) {
    return
  }

  // A non-number, could be a token name
  // Redirect to the `search-result-tokens` list page, uses `search_udt` query to fetch a list
  if (Number.isNaN(+search)) {
    push(`/search-result-tokens?search=${encodeURIComponent(search)}`)
    return
  }

  // Otherwise, search by keyword: address|tx hash|block number
  // Using `search_keyword` query to get a single item
  // Redirect to an account|block|token details page
  try {
    const res = await fetchSearchKeyword(search.toLowerCase())
    push(res)
  } catch (err) {
    window.alert(err.message)
  }
}

export const handleCopy = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
  } catch {
    const input = document.createElement('input')
    input.readOnly = true
    input.value = value
    input.style.position = 'absolute'
    input.style.width = '100px'
    input.style.left = '-10000px'
    document.body.appendChild(input)
    input.select()
    input.setSelectionRange(0, input.value.length)
    document.execCommand('copy')
    document.body.removeChild(input)
  }
}

export const handleNftImageLoadError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = '/images/nft-placeholder.svg'
}

// return a sorter array
export const handleSorterArrayAboutPath = (url, sorters, sorterValueEnum = null) => {
  const params = url.slice(url.indexOf('?') + 1)
  const sorterParamsArray = []

  const searchParams = new URLSearchParams(params)
  Array(...searchParams.keys()).forEach((item, index) => {
    if (sorters.includes(item)) {
      // return sort array which used for query, like: [{sort_type: ASC , sort_value: xxx}]
      if (sorterValueEnum) {
        sorterParamsArray.push({
          sort_type: decodeURIComponent([...searchParams.values()][index]),
          sort_value: sorterValueEnum[item],
        })

        // return sort array which from url, like: [{type: xxx , order: ASC}]
      } else {
        sorterParamsArray.push({ type: item, order: decodeURIComponent([...searchParams.values()][index]) })
      }
    }
  })

  return sorterParamsArray
}

export const handleSorterArrayToMap = (pathSorterArray, onClickedSorter = null) => {
  if (onClickedSorter) {
    const { type } = onClickedSorter
    const arrayExcludeClickedSorter = pathSorterArray.filter(item => item.type !== type)

    arrayExcludeClickedSorter.unshift(onClickedSorter)

    // return a sorter map with the clicked one is on the first position
    return arrayExcludeClickedSorter.reduce((pre, cur) => ({ ...pre, [cur.type]: cur.order }), {})
  } else {
    return pathSorterArray.reduce((pre, cur) => ({ ...pre, [cur.type]: cur.order }), {})
  }
}
