import type { NextApiRequest, NextApiResponse } from 'next'
import { NODE_URL } from '../../utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(404).end()
  }
  try {
    const r = await fetch(NODE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: typeof req.body !== 'object' ? req.body : JSON.stringify(req.body),
    }).then(res => res.json())
    res.status(200).json(r)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
}
