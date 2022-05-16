import { API, SERVER_URL, pretreat } from './utils'

const getMetaContract = (metaContract: API.Account.Raw['meta_contract']): API.Account.Parsed['metaContract'] => ({
  status: metaContract.status,
  accountMerkleState: {
    accountCount: metaContract.account_merkle_state.account_count.toString(),
    accountMerkleRoot: metaContract.account_merkle_state.account_merkle_root.toString(),
  },
  blockMerkleState: {
    blockCount: metaContract.block_merkle_state.block_count.toString(),
    blockMerkleRoot: metaContract.block_merkle_state.block_merkle_root.toString(),
  },
  lastFinalizedBlockNumber: metaContract.last_finalized_block_number.toString(),
  revertedBlockRoot: metaContract.reverted_block_root,
})

const getScript = (script: API.Account.RawScript): API.Account.ParsedScript => ({
  args: script.args,
  codeHash: script.code_hash,
  hashType: script.hash_type,
  name: script.name || null,
})

const getSUDT = (sudt: API.Account.Raw['sudt']): API.Account.Parsed['sudt'] => ({
  decimal: sudt.decimal,
  holders: sudt.holders,
  name: sudt.name,
  supply: sudt.supply,
  symbol: sudt.symbol,
  icon: sudt.icon || null,
  typeScript: sudt.type_script ? getScript(sudt.type_script) : null,
  scriptHash: sudt.script_hash,
})

const getUser = (user: API.Account.Raw['user']): API.Account.Parsed['user'] => ({
  ckbLockScript: user.ckb_lock_script ? getScript(user.ckb_lock_script) : null,
  nonce: user.nonce,
  udtList: user.udt_list || [],
})

const getPolyjuice = (polyjuice: API.Account.Raw['polyjuice']): API.Account.Parsed['polyjuice'] => ({
  script: getScript(polyjuice.script),
  scriptHash: polyjuice.script_hash,
})

const getSmartContract = (smartContract: API.Account.Raw['smart_contract']): API.Account.Parsed['smartContract'] => ({
  txHash: smartContract.tx_hash,
  udtList: smartContract.udt_list || [],
  abi: smartContract.abi ?? [],
  compilerFileFormat: smartContract.compiler_file_format ?? '',
  compilerVersion: smartContract.compiler_version ?? '',
  constructorArguments: smartContract.constructor_arguments ?? '',
  contractSourceCode: smartContract.contract_source_code ?? '',
  creatorAddress: smartContract.creator_address ?? '',
  deploymentTxHash: smartContract.deployment_tx_hash ?? '',
  name: smartContract.name ?? '',
  otherInfo: smartContract.other_info ?? '',
})

export const getAccountRes = (account: API.Account.Raw): API.Account.Parsed => ({
  id: account.id,
  type: account.type,
  ckb: account.ckb,
  txCount: account.tx_count,
  ethAddr: account.eth_addr,
  metaContract: account.meta_contract ? getMetaContract(account.meta_contract) : null,
  sudt: account.sudt ? getSUDT(account.sudt) : null,
  user: account.user ? getUser(account.user) : null,
  polyjuice: account.polyjuice ? getPolyjuice(account.polyjuice) : null,
  smartContract: account.smart_contract ? getSmartContract(account.smart_contract) : null,
})

export const fetchAccount = (id: string): Promise<API.Account.Parsed> =>
  fetch(`${SERVER_URL}/accounts/${id}`)
    .then(res => pretreat<API.Account.Raw>(res))
    .then(getAccountRes)
