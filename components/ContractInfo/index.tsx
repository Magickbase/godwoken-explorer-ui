import type { PolyjuiceContract as PolyjuiceContractProps } from 'components/AccountOverview'
import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { ethers } from 'ethers'
import OpenInNewIcon from 'assets/icons/open-in-new.svg'
import ExpandIcon from 'assets/icons/expand.svg'
import { IS_MAINNET, provider, PCKB_UDT_INFO } from 'utils'
import styles from './styles.module.scss'

interface ChainConfig {
  chainId: string
  rpcUrls: Array<string>
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  blockExplorerUrls: Array<string>
}

const NodeConfigs: Record<'mainnet' | 'testnet', ChainConfig> = {
  mainnet: {
    chainId: '0x116ea',
    rpcUrls: ['https://v1.mainnet.godwoken.io/rpc'],
    chainName: 'Godwoken Mainnet v1',
    nativeCurrency: {
      name: 'pCKB',
      decimals: PCKB_UDT_INFO.decimal,
      symbol: PCKB_UDT_INFO.symbol,
    },
    blockExplorerUrls: ['https://v1.gwscan.com'],
  },
  testnet: {
    chainId: '0x116e9',
    rpcUrls: ['https://godwoken-testnet-v1.ckbapp.dev'],
    chainName: 'Godwoken Testnet v1',
    nativeCurrency: {
      name: 'pCKB',
      decimals: PCKB_UDT_INFO.decimal,
      symbol: PCKB_UDT_INFO.symbol,
    },
    blockExplorerUrls: ['https://v1.testnet.gwscan.com'],
  },
}

const ContractInfo: React.FC<{ address: string; contract: PolyjuiceContractProps['smart_contract'] }> = ({
  address,
  contract: { abi, compiler_file_format, compiler_version, name, contract_source_code, constructor_arguments },
}) => {
  const [tabIdx, setTabIdx] = useState(0)
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null)
  const [addr, setAddr] = useState<string | null>(null)
  const [t] = useTranslation('account')

  useEffect(() => {
    const mmProvider = window['ethereum']
    if (!mmProvider) return

    const nodeConfig = IS_MAINNET ? NodeConfigs.mainnet : NodeConfigs.testnet
    const requestAccounts = () => {
      const mm = new ethers.providers.Web3Provider(mmProvider)
      mm.send(`eth_requestAccounts`, []).then(() => {
        const signer = mm.getSigner()
        if (signer) {
          setSigner(signer)
          signer.getAddress().then(a => setAddr(a))
        } else {
          setAddr(null)
        }
      })
    }

    const handleChainIdChanged = (chainId: string) => {
      if (chainId !== nodeConfig.chainId) {
        window.alert(`Please connect to ${nodeConfig.chainName}`)
      }
    }

    const handleAccountsChanged = (accounts: Array<string>) => {
      if (accounts.length) {
        requestAccounts()
      } else {
        setSigner(null)
        setAddr(null)
      }
    }

    if (tabIdx === 2) {
      mmProvider.request({ method: 'wallet_addEthereumChain', params: [nodeConfig] }).then(requestAccounts)
    }
    mmProvider.on('chainChanged', handleChainIdChanged)
    mmProvider.on('accountsChanged', handleAccountsChanged)
    return () => {
      mmProvider.removeListener('chainChanged', handleChainIdChanged)
      mmProvider.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [tabIdx, setSigner])

  const [contract, viewMethods, writeMethods] = useMemo(() => {
    try {
      if (Array.isArray(abi)) {
        const c = new ethers.Contract(address, abi, tabIdx === 2 ? signer : provider)
        const vMethods = {}
        const wMethods = {}
        Object.keys(c.interface.functions).forEach(name => {
          if (['view', 'pure'].includes(c.interface.functions[name].stateMutability)) {
            vMethods[name] = c.interface.functions[name]
          } else {
            wMethods[name] = c.interface.functions[name]
          }
        })
        return [c, vMethods, wMethods]
      }
      return [null, {}, {}]
    } catch {
      return [null, {}, {}]
    }
  }, [abi, signer, tabIdx])

  const vm = compiler_file_format?.split(' ')[0]
  const chips = [
    name ? `${t('contract_name')}: ${name}` : null,
    compiler_version ? `${t('compiler_version')}: ${compiler_version}` : null,
    compiler_file_format ? `${t('compiler_file_format')}: ${compiler_file_format}` : null,
  ].filter(c => c)

  const viewMethodSignatures = Object.keys(viewMethods)
  const writeMethodSignatures = Object.keys(writeMethods)

  const handleMethodCall = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.stopPropagation()
    e.preventDefault()
    const form = e.currentTarget
    const btn = form.querySelector<HTMLButtonElement>('button')
    const paramInputList = form.querySelectorAll<HTMLInputElement>('input[name=parameter]')
    const resInputList = form.querySelectorAll<HTMLInputElement>('input[name=response]')
    const openInNew = form.querySelector<HTMLDivElement>(`.${styles.openInNew}`)
    const signature = form.dataset['signature']
    const isCallStatic = form.dataset['callStatic']
    const method = isCallStatic
      ? contract.callStatic[contract.interface.functions[signature].name]
      : contract[contract.interface.functions[signature].name]
    const params = Array.from(paramInputList).map(i => i.value)

    if (!method) return
    btn.disabled = true
    const LOADING_ATTRIBUTE = 'data-is-loading'

    if (form.getAttribute(LOADING_ATTRIBUTE)) {
      return
    }

    form.setAttribute(LOADING_ATTRIBUTE, 'true')
    try {
      const result = await method(...params)
      if (tabIdx === 2) {
        const elm = resInputList[0]
        if (elm) {
          elm.value = result.hash
        }
        if (openInNew) {
          openInNew.onclick = () => {
            window.open(`/tx/${result.hash}`)
          }
        }
      } else {
        const resList = Array.isArray(result) ? result : [result]
        resList.map((res, i) => (resInputList[i] ? (resInputList[i].value = res.toString()) : null))
      }
    } catch (err: any) {
      const message = err.data?.message ?? err.message
      window.alert(message)
    } finally {
      btn.disabled = false
      form.removeAttribute(LOADING_ATTRIBUTE)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {['code', 'read_contract', 'write_contract'].map((tab, idx) => (
          <div key={tab} onClick={() => setTabIdx(idx)} data-active={idx === tabIdx}>
            {t(tab)}
          </div>
        ))}
      </div>
      {tabIdx === 0 ? (
        <div>
          <div className={styles.info}>
            {chips.map(c => (
              <div key={c}>{c}</div>
            ))}
          </div>
          {contract_source_code ? (
            <div className={styles.sourceCode}>
              <div className={styles.title}>
                <h6>{t(`contract_source_code`)}</h6>
                {vm ? <div className={styles.vm}>{`(${vm})`}</div> : null}
              </div>
              <textarea defaultValue={contract_source_code} readOnly />
            </div>
          ) : null}
          {contract ? (
            <div className={styles.abi}>
              <h6 className={styles.title}>{t(`abi`)}</h6>
              <textarea defaultValue={JSON.stringify(abi, null, 2)} readOnly />
            </div>
          ) : null}
          {constructor_arguments ? (
            <div className={styles.constructorArgs}>
              <h6 className={styles.title}>{t(`constructor_arguments`)}</h6>
              <textarea defaultValue={constructor_arguments} readOnly />
            </div>
          ) : null}
        </div>
      ) : null}

      {tabIdx === 1 && contract ? (
        <div>
          <div className={styles.methodGroupTitle}>Pure and View</div>
          {viewMethodSignatures.map(signature => {
            const { inputs = [], outputs = [] } = contract.interface.functions[signature] ?? {}
            return (
              <details key={signature}>
                <summary>
                  <div>{`${signature}: ${outputs.map(output => output.type).join(', ')}`}</div>
                  <ExpandIcon />
                </summary>
                <form onSubmit={handleMethodCall} data-signature={signature}>
                  {inputs.length ? <div className={styles.params}>Parameters</div> : null}

                  <div>
                    {inputs.map((input, i: number) => {
                      return (
                        <fieldset key={input.name + i}>
                          <label>{`${input.name ?? t('anonymous_param')}: ${input.type}`}</label>
                          <input
                            name="parameter"
                            placeholder={`${input.name ?? t('anonymous_param')}: ${input.type}`}
                          />
                        </fieldset>
                      )
                    })}
                    <div className={styles.response}>Response</div>
                    {outputs.map((output, i: number) => {
                      return (
                        <fieldset key={output.name + i}>
                          <label>{`${output.name ?? t('anonymous_response')}: ${output.type}`}</label>
                          <input
                            name="response"
                            readOnly
                            placeholder={`${output.name ?? t('anonymous_response')}: ${output.type}`}
                          />
                        </fieldset>
                      )
                    })}
                  </div>
                  <div>
                    <button type="submit">Query</button>
                  </div>
                </form>
              </details>
            )
          })}
          {writeMethodSignatures.length ? (
            <div className={styles.methodGroupTitle} style={{ marginTop: '1.5rem' }}>
              Call Static
            </div>
          ) : null}
          {writeMethodSignatures.map(signature => {
            const { inputs = [], outputs = [] } = contract.interface.functions[signature] ?? {}
            return (
              <details key={signature}>
                <summary>
                  <div>{`${signature}: ${outputs.map(output => output.type).join(', ')}`}</div>
                  <ExpandIcon />
                </summary>
                <form onSubmit={handleMethodCall} data-call-static="true" data-signature={signature}>
                  {inputs.length ? <div className={styles.params}>Parameters</div> : null}

                  <div>
                    {inputs.map((input, i: number) => {
                      return (
                        <fieldset key={input.name + i}>
                          <label>{`${input.name ?? t('anonymous_param')}: ${input.type}`}</label>
                          <input
                            name="parameter"
                            placeholder={`${input.name ?? t('anonymous_param')}: ${input.type}`}
                          />
                        </fieldset>
                      )
                    })}
                    <div className={styles.response}>Response</div>
                    {outputs.map((output, i: number) => {
                      return (
                        <fieldset key={output.name + i}>
                          <label>{`${output.name ?? t('anonymous_response')}: ${output.type}`}</label>
                          <input
                            name="response"
                            readOnly
                            placeholder={`${output.name ?? t('anonymous_response')}: ${output.type}`}
                          />
                        </fieldset>
                      )
                    })}
                  </div>
                  <div>
                    <button type="submit">Query</button>
                  </div>
                </form>
              </details>
            )
          })}
        </div>
      ) : null}

      {tabIdx === 2 && contract ? (
        <div>
          {addr ? (
            <div className={styles.connectedAddr}>
              <span>{t(`connected_addr`)}</span>
              <NextLink href={`/account/${addr}`}>
                <a href={`/account/${addr}`} className="mono-font">
                  {addr}
                </a>
              </NextLink>
            </div>
          ) : null}
          <div className={styles.methodGroupTitle}>Non-payable and Payable</div>
          {writeMethodSignatures.map(signature => {
            const { inputs = [], outputs = [] } = contract.interface.functions[signature] ?? {}
            return (
              <details key={signature}>
                <summary>
                  <div>{`${signature}: ${outputs.map(output => output.type).join(', ')}`}</div>
                  <ExpandIcon />
                </summary>
                <form onSubmit={handleMethodCall} data-signature={signature}>
                  {inputs.length ? <div className={styles.params}>Parameters</div> : null}

                  <div>
                    {inputs.map((input, i: number) => {
                      return (
                        <fieldset key={input.name + i}>
                          <label>{`${input.name ?? t('anonymous_param')}: ${input.type}`}</label>
                          <input
                            name="parameter"
                            placeholder={`${input.name ?? t('anonymous_param')}: ${input.type}`}
                          />
                        </fieldset>
                      )
                    })}
                    <div className={styles.response}>Response</div>
                    <fieldset>
                      <label>Txn Hash</label>
                      <div className={styles.writeRes}>
                        <input name="response" readOnly />
                        <div className={styles.openInNew}>
                          <OpenInNewIcon />
                        </div>
                      </div>
                    </fieldset>
                  </div>
                  <div>
                    <button type="submit">Apply</button>
                  </div>
                </form>
              </details>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default ContractInfo
