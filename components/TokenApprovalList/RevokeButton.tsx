import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { currentChain, erc1155ABI, GraphQLSchema, ZERO_ADDRESS } from 'utils'
import { TokenApprovalEntryType } from '.'
import {
  ConnectorAlreadyConnectedError,
  useConnect,
  erc20ABI,
  erc721ABI,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  ConnectorNotFoundError,
  useNetwork,
  useSwitchNetwork,
  useAccount,
  useTransaction,
} from 'wagmi'
import { ethers } from 'ethers'
import { CircularProgress } from '@mui/material'
import DisconnectIcon from 'assets/icons/disconnect.svg'
import Tooltip from 'components/Tooltip'
import styles from './styles.module.scss'

type Props = {
  setAlert: Dispatch<
    SetStateAction<{
      open: boolean
      type?: 'success' | 'error' | 'warning'
      msg?: string
    }>
  >
  listItem: TokenApprovalEntryType
  account: string
  hideItem: (item: TokenApprovalEntryType) => void
}

const mapEthTypeToABI = (item: TokenApprovalEntryType, tokenId: string) => {
  const map = {
    [GraphQLSchema.TokenType.ERC721]:
      item.type === GraphQLSchema.ApprovalType.ApprovalAll
        ? {
            address: item.token_contract_address_hash,
            abi: erc721ABI,
            function: 'setApprovalForAll',
            args: [item.spender_address_hash, false],
          }
        : {
            address: item.token_contract_address_hash,
            abi: erc721ABI,
            function: 'approve',
            args: [ZERO_ADDRESS, tokenId],
          },
    [GraphQLSchema.TokenType.ERC1155]: {
      address: item.token_contract_address_hash,
      abi: erc1155ABI,
      function: 'setApprovalForAll',
      args: [item.spender_address_hash, false],
    },
  }
  return map[item.udt.eth_type]
}

const RevokeButton: React.FC<Props> = ({ setAlert, listItem, account, hideItem }) => {
  const [t] = useTranslation(['list', 'tokens', 'account'])
  const [currentContract, setCurrentContract] = useState(mapEthTypeToABI(listItem, ''))
  const [isPackaging, setIsPackaging] = useState(false)
  const { transaction_hash, spender_address_hash, token_contract_address_hash, data } = listItem
  const itemKey = transaction_hash + spender_address_hash + token_contract_address_hash + data + '-revokeTxn'
  const [revokeTxnHash, setRevokeTxnHash] = useState(localStorage.getItem(itemKey) || '')
  const [callWrite, setCallWrite] = useState(false)
  const [callingWrite, setCallingWrite] = useState(false)

  /* wagmi hooks */
  const { chain } = useNetwork()
  const targetChainId = currentChain.id
  const { switchNetworkAsync } = useSwitchNetwork({ chainId: targetChainId })
  const { connectAsync, connectors } = useConnect({ chainId: targetChainId })
  const connector = connectors[0] // only have metamask for now
  const { address: connectedAddr } = useAccount()
  const {
    config,
    isLoading: isPreparingContract,
    isFetching: isFetchingContract,
  } = usePrepareContractWrite(
    listItem.udt.eth_type === GraphQLSchema.TokenType.ERC20
      ? {
          chainId: targetChainId,
          address: listItem.token_contract_address_hash,
          abi: erc20ABI,
          functionName: 'approve',
          args: [listItem.spender_address_hash, 0],
        }
      : {
          chainId: targetChainId,
          address: currentContract.address,
          abi: currentContract.abi,
          functionName: currentContract.function,
          args: currentContract.args,
        },
  )
  const { writeAsync } = useContractWrite({ ...config })
  const { isLoading: isRevokeTxnLoading } = useWaitForTransaction({
    hash: revokeTxnHash as `0x${string}`,
    onSuccess: data => {
      if (data?.blockHash) {
        localStorage.removeItem(itemKey)
        setIsPackaging(false)
        setAlert({ open: true, type: 'success', msg: t('revoke-success') })
        // after the block is created, backend still need a few minutes to update tokenApprovalList,
        // so hide this record right after revoke txn is package in a block
        hideItem(listItem)
      }
    },
  })
  const { isLoading: isFetchApproveTxLoading } = useTransaction({
    hash: listItem.transaction_hash as `0x${string}`,
    enabled: listItem.udt.eth_type === GraphQLSchema.TokenType.ERC721,
    onSuccess: data => {
      if (!data) return
      // get tokenId from approve erc721 txn
      const i = new ethers.utils.Interface(erc721ABI)
      const decodedData = i.decodeFunctionData('approve', data.data)
      const tokenId = decodedData[1].toString()
      setCurrentContract(mapEthTypeToABI(listItem, tokenId))
    },
  })

  const isOwner = connectedAddr ? account.toLowerCase() === connectedAddr.toLowerCase() : true
  const disabled =
    !isOwner ||
    isPreparingContract ||
    isFetchingContract ||
    !connector.ready ||
    isRevokeTxnLoading ||
    isFetchApproveTxLoading ||
    isPackaging ||
    callingWrite

  useEffect(() => {
    if (revokeTxnHash) {
      // if revokeTxnHash exists, means it is packaging
      setIsPackaging(true)
    }
  }, [revokeTxnHash])

  const sendWriteCall = useCallback(async () => {
    setCallingWrite(true)
    try {
      const data = await writeAsync()
      setAlert({ open: true, type: 'success', msg: t('revokeTxn-sent-success') })
      localStorage.setItem(itemKey, data?.hash)
      setRevokeTxnHash(data.hash)
    } catch {
      setAlert({ open: true, type: 'error', msg: t('user-rejected') })
    }
    setCallWrite(false)
    setCallingWrite(false)
  }, [itemKey, setAlert, t, writeAsync])

  useEffect(() => {
    if (!writeAsync || callingWrite || chain?.id !== targetChainId) return
    if (callWrite) {
      sendWriteCall()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, callWrite, callingWrite, isPreparingContract, isFetchingContract])

  const tooltipTitle = useCallback(() => {
    if (!isOwner || !connector.ready) {
      return t('not_owner')
    } else if (callingWrite) {
      return t('waiting_for_tx')
    } else if (isPackaging) {
      return t('waiting_for_block')
    } else {
      return t('click_to_revoke')
    }
  }, [connector.ready, isOwner, isPackaging, callingWrite, t])

  return (
    <Tooltip title={tooltipTitle()} placement="top">
      <span>
        <button
          className={styles.revoke}
          disabled={disabled}
          onClick={async () => {
            if (!chain) {
              try {
                await connectAsync({ connector, chainId: targetChainId })
              } catch (error) {
                if (error instanceof ConnectorAlreadyConnectedError) {
                  return
                } else if (error instanceof ConnectorNotFoundError) {
                  setAlert({ open: true, type: 'error', msg: t('ethereum-is-not-injected', { ns: 'tokens' }) })
                } else {
                  setAlert({ open: true, type: 'error', msg: t('user-rejected') })
                }
                return
              }
            }
            if (chain && chain.id !== targetChainId) {
              try {
                if (switchNetworkAsync) {
                  await switchNetworkAsync(targetChainId)
                  setAlert({ open: true, type: 'success', msg: t('switch_network_success') })
                }
              } catch {
                setAlert({ open: true, type: 'error', msg: t('user-rejected') })
                return
              }
            }
            setCallWrite(true)
          }}
        >
          {isPackaging ? (
            <>
              {t('revoking')}
              <div className={styles.loading}>
                <CircularProgress size={12} color="inherit" />
              </div>
            </>
          ) : (
            <>
              {t('revoke')} <DisconnectIcon />
            </>
          )}
        </button>
      </span>
    </Tooltip>
  )
}

export default RevokeButton
