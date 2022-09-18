import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import updateLocale from 'dayjs/plugin/updateLocale'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import BigNumber from 'bignumber.js'
import {
  systemScripts,
  bech32Address,
  AddressPrefix,
  scriptToHash,
  scriptToAddress,
} from '@nervosnetwork/ckb-sdk-utils'
import { IS_MAINNET } from './constants'
import { GraphQLSchema } from './graphql'

dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few secs',
    m: '1 min',
    mm: '%d mins',
    h: '1 hr',
    hh: '%d hrs',
    d: '1 day',
    dd: '%d days',
    M: '1 month',
    MM: '%d months',
    y: '1 year',
    yy: '%d years',
  },
})

export const formatDatetime = (datetime: Parameters<typeof dayjs>[0], format = 'YYYY/MM/DD HH:mm:ss') => {
  return dayjs(datetime).format(format)
}

export const timeDistance = (time: number | string, locale?: 'zh-CN' | 'en-US' | string) => {
  dayjs.locale(locale?.toLowerCase())
  return dayjs(time).fromNow()
}

export const scriptToCkbAddress = (lockScript: CKBComponents.Script) => {
  const scriptList = [
    systemScripts.SECP256K1_BLAKE160,
    systemScripts.SECP256K1_MULTISIG,
    IS_MAINNET ? systemScripts.ANYONE_CAN_PAY_MAINNET : systemScripts.ANYONE_CAN_PAY_TESTNET,
  ]
  const shortIdx = scriptList.findIndex(
    script => script.codeHash === lockScript.codeHash && script.hashType === lockScript.hashType,
  )
  const prefix = IS_MAINNET ? AddressPrefix.Mainnet : AddressPrefix.Testnet
  if (shortIdx > -1) {
    // short address
    return bech32Address(lockScript.args, { prefix, codeHashOrCodeHashIndex: `0x${shortIdx.toString(16)}` })
  }
  return scriptToAddress(lockScript, IS_MAINNET)
}

export const formatInt = (int: string | number) => new BigNumber(int || '0').toFormat()

export const formatAmount = (value: string, udt: Pick<GraphQLSchema.Udt, 'decimal' | 'symbol'>) => {
  if (!udt?.decimal) return new BigNumber(value ?? 0).toFormat()
  const decimal = new BigNumber(10).exponentiatedBy(udt.decimal)
  return `${new BigNumber(value).dividedBy(decimal).toFormat()} ${udt.symbol ?? ''}`
}

export { scriptToHash }

export const nameToColor = (name: string = '') => '#' + 2 * (name?.[0] ?? '?').charCodeAt(0)

export const getIpfsUrl = (url: string) => {
  try {
    const u = new URL(url)
    if (u.protocol === 'ipfs:') {
      return `https://ipfs.io/ipfs/${url.slice(7)}`
    }
    return url
  } catch {
    return url
  }
}
