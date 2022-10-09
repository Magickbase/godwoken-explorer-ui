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
} from 'wagmi'
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
  hideItem: (txnHash: string) => void
}

const mapEthTypeToABI = (item: TokenApprovalEntryType) => {
  const map = {
    [GraphQLSchema.TokenType.ERC20]: {
      address: item.token_contract_address_hash,
      abi: erc20ABI,
      function: 'approve',
      args: [item.spender_address_hash, 0],
    },
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
            args: [ZERO_ADDRESS, item.data],
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
  const currentContract = mapEthTypeToABI(listItem)
  const [callWrite, setCallWrite] = useState(false)
  const [isPackaging, setIsPackaging] = useState(false)

  /* wagmi hooks */
  const { chain } = useNetwork()
  const targetChainId = currentChain.id
  const { switchNetwork } = useSwitchNetwork({
    onSuccess: () => {
      setAlert({ open: true, type: 'success', msg: t('switch_network_success') })
    },
    onError: () => {
      setAlert({ open: true, type: 'error', msg: t('user-rejected') })
    },
  })
  const { connect, connectors, isSuccess } = useConnect({
    chainId: targetChainId,
    onError(error) {
      if (error instanceof ConnectorAlreadyConnectedError) {
        return
      } else if (error instanceof ConnectorNotFoundError) {
        setAlert({ open: true, type: 'error', msg: t('ethereum-is-not-injected', { ns: 'tokens' }) })
      } else {
        setAlert({ open: true, type: 'error', msg: t('connect-mm-fail') })
      }
    },
  })
  const connector = connectors[0] // only have metamask for now
  const { address: connectedAddr, isConnected } = useAccount()
  const { config, isLoading: isPreparingContract } = usePrepareContractWrite({
    chainId: targetChainId,
    addressOrName: currentContract.address,
    contractInterface: currentContract.abi,
    functionName: currentContract.function,
    args: currentContract.args,
  })
  const { data: revokeTxn, write } = useContractWrite({
    ...config,
    onSuccess: () => {
      setAlert({ open: true, type: 'success', msg: t('revokeTxn-sent-success') })
      setIsPackaging(true)
    },
    onError: () => {
      setAlert({ open: true, type: 'error', msg: t('user-rejected') })
    },
  })
  const { isLoading: isRevokeTxnLoading } = useWaitForTransaction({
    hash: revokeTxn?.hash,
    onSuccess: data => {
      if (data?.blockHash) {
        setIsPackaging(false)
        setAlert({ open: true, type: 'success', msg: t('revoke-success') })
        // seems after the block is created, backend still need a few minutes to update tokenApprovalList,
        // so hide this record right after revoke txn is package in a block
        hideItem(listItem.transaction_hash)
      }
    },
  })

  const isOwner = connectedAddr ? account.toLowerCase() === connectedAddr.toLowerCase() : true
  const disabled = !isOwner || isPreparingContract || !connector.ready || isRevokeTxnLoading || isPackaging

  useEffect(() => {
    if (!isConnected) {
      connect({ connector, chainId: targetChainId })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (callWrite) {
      if (chain && chain.id !== targetChainId) {
        switchNetwork?.(targetChainId)
      }
      if (chain && chain?.id === targetChainId) {
        write?.()
      }
    }
    setCallWrite(false)
  }, [callWrite, chain, switchNetwork, targetChainId, write])

  const tooltipTitle = useCallback(() => {
    if (!isOwner || !connector.ready) {
      return t('not_owner')
    } else if (isPackaging) {
      return ''
    } else {
      return t('click_to_revoke')
    }
  }, [connector.ready, isOwner, isPackaging, t])

  return (
    <Tooltip title={tooltipTitle()} placement="top">
      <span>
        <button
          className={styles.revoke}
          disabled={disabled}
          onClick={() => {
            if (!isConnected) {
              connect({ connector, chainId: targetChainId })
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
