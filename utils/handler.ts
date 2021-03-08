import { ServerResponse } from 'http'
import { NotFoundException } from './exceptions'

export const handleApiError = (err: Error, res: ServerResponse): { notFound: true } => {
  if (err instanceof NotFoundException) {
    return {
      notFound: true,
    }
  }
  console.warn(err.message)
  res.setHeader('location', `/error?message=${err.message}`)
  res.statusCode = 302
  res.end()
  return
}
