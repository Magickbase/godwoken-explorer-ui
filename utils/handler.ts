import { ServerResponse } from 'http'
import { NotFoundException } from './exceptions'
import { fetchSearch } from './api'

export const handleApiError = (err: Error, res: ServerResponse, locale: string, query?: string) => {
  if (err instanceof NotFoundException) {
    res.statusCode = 404
    return {
      redirect: {
        destination: `/${locale}/404${query ? '?query=' + query : ''}`,
        permanent: false,
      },
    }
  }
  console.warn(err.message)
  res.setHeader('location', `/error?message=${err.message}`)
  res.statusCode = 302
  res.end()
  return
}

export const handleSearchKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>, push: (url: string) => any) => {
  const { key, target } = e
  const search = (target as HTMLInputElement).value
  if (key !== 'Enter' || !search) {
    return
  }
  try {
    const res = await fetchSearch(search.toLowerCase())
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
