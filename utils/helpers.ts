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
