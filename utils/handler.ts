import { ServerResponse } from 'http'
import { NotFoundException } from './exceptions'

export const handleApiError = (err: Error, res: ServerResponse) => {
  if (err instanceof NotFoundException) {
    res.setHeader('location', '/404')
    res.statusCode = 302
    res.end()
    return
  }
  console.warn(err.message)
  res.setHeader('location', '/')
  res.statusCode = 302
  res.end()
  return
}
