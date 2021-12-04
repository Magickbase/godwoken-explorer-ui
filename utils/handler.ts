import { ServerResponse } from 'http'
import { NotFoundException } from './exceptions'

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
