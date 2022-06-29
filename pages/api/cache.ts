import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchHome } from 'utils'

export interface Cache {
  home: Awaited<ReturnType<typeof fetchHome>>
}

const cache: Partial<Cache> = {}

const updateCache = async () => {
  try {
    const res = await fetchHome()
    cache.home = res
  } catch {
    // ignore
  }
}

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  if (!cache.home) {
    await updateCache()
  }
  res.status(200).json(cache)
}

setInterval(updateCache, 1000)
