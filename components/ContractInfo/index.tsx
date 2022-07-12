import type { PolyjuiceContract as PolyjuiceContractProps } from '../AccountOverview'
import { useState, useMemo, useEffect } from 'react'
import { styled } from '@mui/system'
import { useTranslation } from 'next-i18next'
import { ethers } from 'ethers'
import {
  Box,
  Stack,
  Chip,
  TabsUnstyled,
  TabUnstyled,
  TabsListUnstyled,
  TextareaAutosize,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Button,
  CircularProgress,
  buttonUnstyledClasses,
  tabUnstyledClasses,
} from '@mui/material'
import { ExpandMore as ExpandMoreIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material'
import { IS_MAINNET, provider } from 'utils'
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
      symbol: 'pCKB',
      decimals: 18,
    },
    blockExplorerUrls: ['https://v1.gwscan.com'],
  },
  testnet: {
    chainId: '0x116e9',
    rpcUrls: ['https://godwoken-testnet-v1.ckbapp.dev'],
    chainName: 'Godwoken Testnet v1',
    nativeCurrency: {
      name: 'pCKB',
      symbol: 'pCKB',
      decimals: 18,
    },
    blockExplorerUrls: ['https://v1.testnet.gwscan.com'],
  },
}

const grey = {
  50: '#fafafa',
  100: 'rgba(0,0,0,0.08)',
  200: '#eee',
  400: '#bdbdbd',
  600: '#757575',
}

const Tab = styled(TabUnstyled)`
  color: ${grey[600]};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: bold;
  background-color: transparent;
  width: 100%;
  padding: 8px 12px;
  margin: 6px 6px;
  border: none;
  border-radius: 5px;
  display: flex;
  justify-content: center;

  &:hover {
    background-color: ${grey[50]};
  }

  &:focus {
    border-radius: 3px;
    outline: 2px solid ${grey[200]};
    outline-offset: 2px;
  }

  &.${tabUnstyledClasses.selected} {
    background-color: ${grey[100]};
    color: ${grey[600]};
  }

  &.${buttonUnstyledClasses.disabled} {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const TabsList = styled(TabsListUnstyled)`
  min-width: 320px;
  background-color: ${grey[500]};
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  align-content: space-between;
`

const textareaStyle: React.CSSProperties = {
  padding: '8px',
  resize: 'vertical',
  height: '50ch',
  overflow: 'auto',
  background: '#F9F9F9',
  color: '#080808',
  borderRadius: '4px',
  borderColor: '#ddd',
}

const ContractInfo: React.FC<{ address: string; contract: PolyjuiceContractProps['smart_contract'] }> = ({
  address,
  contract: { abi, compiler_file_format, compiler_version, name, contract_source_code, constructor_arguments },
}) => {
  const [tabIdx, setTabIdx] = useState(0)
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null)
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
        }
      })
    }

    const handleChainIdChanged = (chainId: string) => {
      if (chainId !== nodeConfig.chainId) {
        window.alert(`Please connect to ${nodeConfig.chainName}`)
      }
    }

    const handleAccountsChanged = () => {
      requestAccounts()
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

  const handleTabChange = (_: React.SyntheticEvent, newIdx: number) => setTabIdx(newIdx)
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
    const loading = form.querySelector<HTMLDivElement>('.contract-loading')
    const paramInputList = form.querySelectorAll<HTMLInputElement>('input[name=parameter]')
    const resInputList = form.querySelectorAll<HTMLInputElement>('input[name=response]')
    const openInNew = form.querySelector<HTMLDivElement>(`.${styles.openInNew}`)
    const signature = form.dataset['signature']
    const method = contract[contract.interface.functions[signature].name]
    const params = Array.from(paramInputList).map(i => i.value)

    if (!method) return
    btn.disabled = true
    if (loading) {
      loading.style.display = 'block'
    }
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
    } catch (err) {
      window.alert(err.message)
    } finally {
      btn.disabled = false
      if (loading) {
        loading.style.display = 'none'
      }
    }
  }

  return (
    <Box sx={{ width: '100%' }} className={styles.container}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabsUnstyled value={tabIdx} onChange={handleTabChange} style={{ width: 'min-content', marginTop: 8 }}>
          <TabsList>
            <Tab>{t('code')}</Tab>
            {contract ? <Tab sx={{ whiteSpace: 'nowrap' }}>{t(`read_contract`)}</Tab> : null}
            {contract ? <Tab sx={{ whiteSpace: 'nowrap' }}>{t(`write_contract`)}</Tab> : null}
          </TabsList>
        </TabsUnstyled>
        {tabIdx === 0 ? (
          <Stack direction="column" sx={{ p: '0px 16px 16px 16px' }} spacing={4}>
            <Stack direction="row" flexWrap="wrap">
              {chips.map(c => (
                <Chip key={c} label={c} style={{ margin: '0 8px 8px 0' }} />
              ))}
            </Stack>
            {contract_source_code ? (
              <Stack>
                <Stack direction="row" alignItems="center">
                  <Typography variant="h6">{t(`contract_source_code`)}</Typography>
                  {vm ? <Typography variant="body2" color="grey" ml={1}>{`(${vm})`}</Typography> : null}
                </Stack>
                <TextareaAutosize defaultValue={contract_source_code} readOnly style={textareaStyle} />
              </Stack>
            ) : null}
            {contract ? (
              <Stack>
                <Typography variant="h6">{t(`abi`)}</Typography>
                <TextareaAutosize defaultValue={JSON.stringify(abi, null, 2)} readOnly style={textareaStyle} />
              </Stack>
            ) : null}
            {constructor_arguments ? (
              <Stack>
                <Typography variant="h6">{t(`constructor_arguments`)}</Typography>
                <TextareaAutosize defaultValue={constructor_arguments} readOnly style={textareaStyle} />
              </Stack>
            ) : null}
          </Stack>
        ) : null}

        {tabIdx === 1 && contract ? (
          <Stack sx={{ p: '0px 16px 16px 16px' }} spacing={2}>
            {viewMethodSignatures.map(signature => {
              const { inputs = [], outputs = [] } = contract.interface.functions[signature] ?? {}
              return (
                <Accordion key={signature} sx={{ boxShadow: 'none', border: '1px solid #ddd' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2">{`${signature}: ${outputs
                      .map(output => output.type)
                      .join(', ')}`}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <form onSubmit={handleMethodCall} data-signature={signature}>
                      {inputs.length ? (
                        <Divider>
                          <Typography variant="body2">Parameters</Typography>
                        </Divider>
                      ) : null}

                      <Stack spacing={2}>
                        {inputs.map((input, i: number) => {
                          return (
                            <fieldset key={input.name + i}>
                              <label>{`${input.name ?? t('anonymous_param')}: ${input.type}`}</label>
                              <input name="parameter" />
                            </fieldset>
                          )
                        })}
                        <Divider>
                          <Typography variant="body2">Response</Typography>
                        </Divider>
                        {outputs.map((output, i: number) => {
                          return (
                            <fieldset key={output.name + i}>
                              <label>{`${output.name ?? t('anonymous_response')}: ${output.type}`}</label>
                              <input name="response" readOnly />
                            </fieldset>
                          )
                        })}
                      </Stack>
                      <Box sx={{ textAlign: 'right', marginTop: '16px' }}>
                        <Button type="submit" variant="contained" size="small">
                          Query
                          <CircularProgress
                            className="contract-loading"
                            size={24}
                            sx={{
                              display: 'none',
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              marginTop: '-12px',
                              marginLeft: '-12px',
                            }}
                          />
                        </Button>
                      </Box>
                    </form>
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </Stack>
        ) : null}

        {tabIdx === 2 && contract ? (
          <Stack sx={{ p: '0px 16px 16px 16px' }} spacing={2}>
            {writeMethodSignatures.map(signature => {
              const { inputs = [], outputs = [] } = contract.interface.functions[signature] ?? {}
              return (
                <Accordion key={signature} sx={{ boxShadow: 'none', border: '1px solid #ddd' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2">{`${signature}: ${outputs
                      .map(output => output.type)
                      .join(', ')}`}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <form onSubmit={handleMethodCall} data-signature={signature}>
                      {inputs.length ? (
                        <Divider>
                          <Typography variant="body2">Parameters</Typography>
                        </Divider>
                      ) : null}

                      <Stack spacing={2}>
                        {inputs.map((input, i: number) => {
                          return (
                            <fieldset key={input.name + i}>
                              <label>{`${input.name ?? t('anonymous_param')}: ${input.type}`}</label>
                              <input name="parameter" />
                            </fieldset>
                          )
                        })}
                        <Divider>
                          <Typography variant="body2">Response</Typography>
                        </Divider>
                        <fieldset>
                          <label>Txn Hash</label>
                          <input name="response" readOnly />
                          <div className={styles.openInNew}>
                            <OpenInNewIcon />
                          </div>
                        </fieldset>
                      </Stack>
                      <Box sx={{ textAlign: 'right', marginTop: '16px' }}>
                        <Button type="submit" variant="contained" size="small">
                          Apply
                          <CircularProgress
                            className="contract-loading"
                            size={24}
                            sx={{
                              display: 'none',
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              marginTop: '-12px',
                              marginLeft: '-12px',
                            }}
                          />
                        </Button>
                      </Box>
                    </form>
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </Stack>
        ) : null}
      </Box>
    </Box>
  )
}

export default ContractInfo
