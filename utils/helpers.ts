import { utils, providers } from 'ethers'
import { NODE_URL } from './constants'

export const isEthAddress = (hash: string) => {
  try {
    if (utils.getAddress(hash)) {
      return true
    }
  } catch {
    // ignore
  }
  return false
}

export const provider = new providers.JsonRpcProvider(NODE_URL)

export const parseTokenName = (name: string) => {
  const parsed = name?.split(/\(via|from/) ?? []
  return {
    name: parsed[0]?.trim() ?? '',
    bridge: parsed[1]?.trim() ?? '',
    origin: parsed[2]?.trim().slice(0, -1) ?? '',
  }
}
