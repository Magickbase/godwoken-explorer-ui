import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import {
  systemScripts,
  bech32Address,
  AddressPrefix,
  scriptToHash,
  scriptToAddress,
} from '@nervosnetwork/ckb-sdk-utils'
import { IS_MAINNET } from './constants'

dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
export const formatDatetime = (datetime: number) => {
  return dayjs(datetime).format('YYYY/MM/DD HH:mm:ss')
}

export const timeDistance = (time: number, locale?: 'zh-CN' | 'en-US' | string) => {
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

export const formatInt = (int: string | number) => {
  const i = typeof int === 'string' ? int : int.toString()
  return (
    i
      .split('')
      .reverse()
      .join('')
      .match(/\d{1,3}/g) || [0]
  )
    .join(',')
    .split('')
    .reverse()
    .join('')
}
export const formatBalance = (balance: string) => {
  const [int, dec] = balance.split('.')
  const formattedInt = formatInt(int)
  return dec ? [formattedInt, dec].join('.') : formattedInt
}

export { scriptToHash }

export const nameToColor = (name: string = '') => '#' + 2 * (name?.[0] ?? '?').charCodeAt(0)
