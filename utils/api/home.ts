import { API, SERVER_URL, pretreat } from './utils'
export const getHomeRes = (home: API.Home.Raw): API.Home.Parsed => ({
  blockList: home.block_list.map(({ hash, number, tx_count, timestamp }) => ({
    hash,
    number,
    txCount: tx_count,
    timestamp: timestamp * 1000,
  })),
  txList: home.tx_list.map(tx => ({ ...tx, timestamp: tx.timestamp * 1000, success: tx.success ?? true })),
  statistic: {
    blockCount: home.statistic.block_count,
    txCount: home.statistic.tx_count,
    tps: home.statistic.tps,
    accountCount: home.statistic.account_count,
  },
})
export const fetchHome = (): Promise<API.Home.Parsed> =>
  fetch(`${SERVER_URL}/home`)
    .then(res => pretreat<API.Home.Raw>(res))
    .then(getHomeRes)
