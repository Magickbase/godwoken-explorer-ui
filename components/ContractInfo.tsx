import { useState, useMemo } from 'react'
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
  TextField,
  Button,
  CircularProgress,
  buttonUnstyledClasses,
  tabUnstyledClasses,
} from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'

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

export interface ContractInfoProps {
  address: string
  abi: Array<any>
  compilerFileFormat: string
  compilerVersion: string
  constructorArguments: string
  contractSourceCode: string
  deploymentTxHash: string
  name: string
  otherInfo: string
}

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

const ContractInfo: React.FC<ContractInfoProps> = ({
  address,
  abi,
  compilerVersion,
  compilerFileFormat,
  contractSourceCode,
  constructorArguments,
  name,
  // otherInfo,
}) => {
  const [tabIdx, setTabIdx] = useState(0)
  const [responseList, setResponseList] = useState([])
  const [loadingList, setLoadingList] = useState([])
  const [t] = useTranslation('account')

  const [contract, viewMethods] = useMemo(() => {
    try {
      const provider = new ethers.providers.JsonRpcProvider('/api/rpc')
      if (Array.isArray(abi)) {
        const c = new ethers.Contract(address, abi, provider)
        const vMethods = {}
        Object.keys(c.interface.functions).forEach(name => {
          if (c.interface.functions[name].stateMutability === 'view') {
            vMethods[name] = c.interface.functions[name]
          }
        })
        return [c, vMethods]
      }
      return [null, {}]
    } catch {
      return [null, {}]
    }
  }, [abi])
  const handleTabChange = (_: React.SyntheticEvent, newIdx: number) => setTabIdx(newIdx)
  const vm = compilerFileFormat.split(' ')[0]
  const chips = [
    name ? `${t('contract_name')}: ${name}` : null,
    compilerVersion ? `${t('compiler_version')}: ${compilerVersion}` : null,
    compilerFileFormat ? `${t('compiler_file_format')}: ${compilerFileFormat}` : null,
  ].filter(c => c)

  const viewMethodSignatures = Object.keys(viewMethods)

  const handleMethodCall = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.stopPropagation()
    e.preventDefault()
    const target = e.currentTarget
    const idx = +target.dataset['idx']
    const signature = viewMethodSignatures[idx]
    const { inputs = [] } = contract.interface.functions[signature] ?? {}
    const params = inputs.map(input => target[input.name].value)
    const method = contract[viewMethods[signature].name]
    try {
      setLoadingList(pre => {
        const loadings = [...pre]
        loadings[idx] = true
        return loadings
      })
      const result = await method(...params)
      setResponseList(list => {
        const items = [...list]
        items[idx] = result.toString()
        return items
      })
    } catch (err) {
      window.alert(err.message)
    } finally {
      setLoadingList(pre => {
        const loadings = [...pre]
        loadings[idx] = false
        return loadings
      })
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabsUnstyled value={tabIdx} onChange={handleTabChange} style={{ width: 'min-content', marginTop: 8 }}>
          <TabsList>
            <Tab>{t('code')}</Tab>
            {contract ? <Tab>{t(`read_contract`)}</Tab> : null}
          </TabsList>
        </TabsUnstyled>
        {tabIdx === 0 ? (
          <Stack direction="column" sx={{ p: '0px 16px 16px 16px' }} spacing={4}>
            <Stack direction="row" flexWrap="wrap">
              {chips.map(c => (
                <Chip key={c} label={c} style={{ margin: '0 8px 8px 0' }} />
              ))}
            </Stack>
            {contractSourceCode ? (
              <Stack>
                <Stack direction="row" alignItems="center">
                  <Typography variant="h6">{t(`contract_source_code`)}</Typography>
                  {vm ? <Typography variant="body2" color="grey" ml={1}>{`(${vm})`}</Typography> : null}
                </Stack>
                <TextareaAutosize defaultValue={contractSourceCode} readOnly style={textareaStyle} />
              </Stack>
            ) : null}
            {contract ? (
              <Stack>
                <Typography variant="h6">{t(`abi`)}</Typography>
                <TextareaAutosize defaultValue={JSON.stringify(abi, null, 2)} readOnly style={textareaStyle} />
              </Stack>
            ) : null}
            {constructorArguments ? (
              <Stack>
                <Typography variant="h6">{t(`constructor_arguments`)}</Typography>
                <TextareaAutosize defaultValue={constructorArguments} readOnly style={textareaStyle} />
              </Stack>
            ) : null}
          </Stack>
        ) : null}

        {tabIdx === 1 && contract ? (
          <Stack sx={{ p: '0px 16px 16px 16px' }} spacing={2}>
            {viewMethodSignatures.map((signature, idx) => {
              const { inputs = [], outputs = [] } = contract.interface.functions[signature] ?? {}
              return (
                <Accordion key={signature} sx={{ boxShadow: 'none', border: '1px solid #ddd' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2">{`${signature}`}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <form onSubmit={handleMethodCall} data-idx={idx}>
                      {inputs.length ? (
                        <Divider>
                          <Typography variant="body2">Parameters</Typography>
                        </Divider>
                      ) : null}

                      <Stack spacing={2}>
                        {inputs.map((input, i) => {
                          return (
                            <TextField
                              key={input.name + i}
                              name={input.name}
                              label={`${input.name}: ${input.type}`}
                              size="small"
                              variant="filled"
                            />
                          )
                        })}
                        <Divider>
                          <Typography variant="body2">Response</Typography>
                        </Divider>
                        {outputs.map((output, i) => {
                          return (
                            <TextField
                              key={output.name + i}
                              label={`${output.name ?? ''}: ${output.type}`}
                              variant="filled"
                              inputProps={{ readOnly: true }}
                              value={responseList[idx] ?? ''}
                            />
                          )
                        })}
                      </Stack>
                      <Box sx={{ textAlign: 'right', marginTop: '16px' }}>
                        <Button type="submit" variant="contained" size="small" disabled={loadingList[idx]}>
                          Query
                          {loadingList[idx] ? (
                            <CircularProgress
                              size={24}
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-12px',
                                marginLeft: '-12px',
                              }}
                            />
                          ) : null}
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
