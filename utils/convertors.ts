import { format, formatDistanceToNow } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import {
  systemScripts,
  bech32Address,
  fullPayloadToAddress,
  AddressPrefix,
  AddressType,
} from '@nervosnetwork/ckb-sdk-utils'
import { IS_MAINNET } from './constants'

export const formatDatetime = (datetime: number) => {
  return format(new Date(datetime), 'yyyy/MM/dd hh:mm:ss')
}

export const timeDistance = (time: number, locale?: 'zh-CN' | 'en-US' | string) =>
  formatDistanceToNow(new Date(time), {
    addSuffix: true,
    includeSeconds: true,
    locale: locale === 'zh-CN' ? zhCN : enUS,
  })

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
    return bech32Address(lockScript.args, { prefix, codeHashOrCodeHashIndex: `${shortIdx}` })
  }
  return fullPayloadToAddress({
    args: lockScript.args,
    prefix,
    type: lockScript.hashType === 'data' ? AddressType.DataCodeHash : AddressType.TypeCodeHash,
    codeHash: lockScript.codeHash,
  })
}
