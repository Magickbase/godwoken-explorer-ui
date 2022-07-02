import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchHomeLists } from 'pages'
import { fetchHome } from 'utils'

export interface Cache {
  home: Awaited<ReturnType<typeof fetchHome>>
  homeLists: Awaited<ReturnType<typeof fetchHomeLists>>
}

const cache: Partial<Cache> = {}

const updateCache = async () => {
  try {
    const [home, homeLists] = await Promise.all([fetchHome(), fetchHomeLists()])
    cache.home = home
    cache.homeLists = homeLists
  } catch {
    // ignore
  }
}

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  if (!cache.home || !cache.homeLists) {
    await updateCache()
  }
  res.status(200).json(cache)
}

setInterval(updateCache, 1000)
