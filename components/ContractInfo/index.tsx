import type { PolyjuiceContract as PolyjuiceContractProps } from 'components/AccountOverview'
import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { utils } from 'ethers'
import OpenInNewIcon from 'assets/icons/open-in-new.svg'
import ExpandIcon from 'assets/icons/expand.svg'
import { currentChain as targetChain } from 'utils'
import styles from './styles.module.scss'
import {
  ConnectorAlreadyConnectedError,
  ConnectorNotFoundError,
  useConnect,
  useAccount,
  useSigner,
  useProvider,
  useNetwork,
  useSwitchNetwork,
  useContract,
  UserRejectedRequestError,
} from 'wagmi'
import Alert from 'components/Alert'

const ContractInfo: React.FC<{ address: string; contract: PolyjuiceContractProps['smart_contract'] }> = ({
  address,
  contract: {
    abi,
    compiler_file_format,
    compiler_version,
    name,
    contract_source_code,
    sourcify_metadata,
    constructor_arguments,
  },
}) => {
  const [t] = useTranslation(['account', 'tokens', 'list'])
  const [tabIdx, setTabIdx] = useState(0)
  const vm = compiler_file_format?.split(' ')[0]
  const chips = [
    name ? `${t('contract_name')}: ${name}` : null,
    compiler_version ? `${t('compiler_version')}: ${compiler_version}` : null,
    compiler_file_format ? `${t('compiler_file_format')}: ${compiler_file_format}` : null,
  ].filter(c => c)
  const [alert, setAlert] = useState<{ open: boolean; type?: 'success' | 'error' | 'warning'; msg?: string }>({
    open: false,
    type: 'success',
    msg: '',
  })
  const [viewMethods, setViewMethods] = useState({})
  const [writeMethods, setWriteMethods] = useState({})

  // wagmi hooks
  const { connect, connectAsync, connectors } = useConnect({
    chainId: targetChain.id,
    onError: error => {
      if (error instanceof ConnectorAlreadyConnectedError) {
        return
      } else if (error instanceof ConnectorNotFoundError) {
        setAlert({ open: true, type: 'error', msg: t('ethereum-is-not-injected', { ns: 'tokens' }) })
      } else {
        setAlert({ open: true, type: 'error', msg: t('connect-mm-fail', { ns: 'list' }) })
      }
    },
  })
  const connector = connectors[0] // only have metamask
  const { address: addr } = useAccount()
  const { data: signer } = useSigner()
  const provider = useProvider()
  const { chain } = useNetwork()
  const { switchNetwork, switchNetworkAsync } = useSwitchNetwork({
    onSuccess: () => {
      setAlert({ open: true, type: 'success', msg: t('switch_network_success', { ns: 'list' }) })
    },
    onError: () => {
      setAlert({ open: true, type: 'error', msg: t('user-rejected', { ns: 'list' }) })
    },
  })
  const contract = useContract({
    address: address,
    abi: abi,
    signerOrProvider: tabIdx === 2 ? signer : provider,
  })

  useEffect(() => {
    if (tabIdx === 2) {
      if (chain?.id !== targetChain.id && switchNetwork) {
        switchNetwork(targetChain.id)
      }
      connect({ connector, chainId: targetChain.id })
    }
  }, [connect, connector, tabIdx, targetChain.id])

  useEffect(() => {
    try {
      if (Array.isArray(abi)) {
        const c = contract
        const vMethods = {}
        const wMethods = {}
        Object.keys(c.interface.functions).forEach(name => {
          if (['view', 'pure'].includes(c.interface.functions[name].stateMutability)) {
            vMethods[name] = c.interface.functions[name]
          } else {
            wMethods[name] = c.interface.functions[name]
          }
        })
        setViewMethods(vMethods)
        setWriteMethods(wMethods)
      } else {
        setViewMethods({})
        setWriteMethods({})
      }
    } catch {
      setViewMethods({})
      setWriteMethods({})
    }
  }, [abi, contract])

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

    try {
      if (tabIdx === 2 && chain?.id !== targetChain.id) {
        if (switchNetworkAsync) {
          await switchNetworkAsync(targetChain.id)
        } else {
          await connectAsync({ connector, chainId: targetChain.id })
        }
      }
    } catch (err) {
      if (err instanceof UserRejectedRequestError) {
        setAlert({ open: true, type: 'error', msg: t('user-rejected', { ns: 'list' }) })
      } else if (!(err instanceof ConnectorAlreadyConnectedError)) {
        setAlert({ open: true, type: 'error', msg: err.message })
      }
      return
    }

    form.setAttribute(LOADING_ATTRIBUTE, 'true')

    try {
      const pCKB = form.querySelector<HTMLInputElement>('input[name=pCKB]')?.value ?? '0'
      const result = await method(...params, { value: utils.parseEther(pCKB) })
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
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        setAlert({ open: true, type: 'error', msg: t('user-rejected', { ns: 'list' }) })
      } else {
        const message = err.data?.message ?? err.message
        if (message.length > 60) {
          window.alert(message)
        } else {
          setAlert({ open: true, type: 'error', msg: message })
        }
      }
    } finally {
      btn.disabled = false
      form.removeAttribute(LOADING_ATTRIBUTE)
    }
  }

  return (
    <div className={styles.container}>
      <Alert
        open={alert?.open}
        onClose={() => setAlert({ ...alert, open: false })}
        content={alert.msg}
        type={alert.type}
      />
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
            <>
              {Array.isArray(sourcify_metadata) ? (
                sourcify_metadata.map(code => {
                  if (!code.name.endsWith('.sol')) {
                    return null
                  }
                  return (
                    <div className={styles.sourceCode} key={code.name}>
                      <div className={styles.title}>
                        <h6>{code.name}</h6>
                        {vm ? <div className={styles.vm}>{`(${vm})`}</div> : null}
                      </div>
                      <textarea defaultValue={code.content} readOnly />
                    </div>
                  )
                })
              ) : (
                <div className={styles.sourceCode}>
                  <div className={styles.title}>
                    <h6>{t(`contract_source_code`)}</h6>
                    {vm ? <div className={styles.vm}>{`(${vm})`}</div> : null}
                  </div>
                  <textarea defaultValue={contract_source_code} readOnly />
                </div>
              )}
            </>
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
          {Object.keys(viewMethods).map(signature => {
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
          {Object.keys(writeMethods).length ? (
            <div className={styles.methodGroupTitle} style={{ marginTop: '1.5rem' }}>
              Call Static
            </div>
          ) : null}
          {Object.keys(writeMethods).map(signature => {
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
          {Object.keys(writeMethods).map(signature => {
            const { inputs = [], outputs = [], payable } = contract.interface.functions[signature] ?? {}
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
                    {payable ? (
                      <fieldset key="pCKB">
                        <label>pCKB</label>
                        <input name="pCKB" title="pCKB" placeholder={t('pckb_send_along_with_tx')} />
                      </fieldset>
                    ) : null}
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
