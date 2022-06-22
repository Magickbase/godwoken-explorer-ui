import { utils } from 'ethers'
import type { TxStatus } from './api'
import { GraphQLSchema } from './graphql'

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

export const getBlockStatus = (block: Pick<GraphQLSchema.Block, 'status'> | null): TxStatus => {
  switch (block?.status) {
    case GraphQLSchema.BlockStatus.Committed: {
      return 'committed'
    }
    case GraphQLSchema.BlockStatus.Finalized: {
      return 'finalized'
    }
    default: {
      return 'pending'
    }
  }
}
