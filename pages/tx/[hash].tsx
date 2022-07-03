import { useEffect, useState, useMemo } from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useQuery } from 'react-query'
import {
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  colors,
  Paper,
  Container,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Link,
  Grid,
  ListSubheader,
  Stack,
  Tooltip,
  IconButton,
  Snackbar,
  Tabs,
  Tab,
  Skeleton,
} from '@mui/material'
import {
  OpenInNew as OpenInNewIcon,
  ContentCopyOutlined as CopyIcon,
  ErrorOutlineOutlined as ErrorIcon,
  AccessTimeOutlined as PendingIcon,
} from '@mui/icons-material'
import { ExpandMore } from '@mui/icons-material'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import SubpageHead from 'components/SubpageHead'
import PageTitle from 'components/PageTitle'
import Address from 'components/AddressInHalfPanel'
import TransferList, { fetchTransferList } from 'components/SimpleERC20TransferList'
import TxLogsList from 'components/TxLogsList'
import {
  formatDatetime,
  fetchTx,
  useWS,
  getTxRes,
  formatInt,
  handleCopy,
  fetchEventLogsListByType,
  handleApiError,
  CKB_EXPLORER_URL,
  CHANNEL,
  CKB_DECIMAL,
  GCKB_DECIMAL,
  NotFoundException,
} from 'utils'

type RawTx = Parameters<typeof getTxRes>[0]
type ParsedTx = ReturnType<typeof getTxRes>

const tabs = ['erc20', 'logs']
type State = ParsedTx
const ADDR_LENGTH = 42

const Tx = (initState: State) => {
  const [tx, setTx] = useState(initState)
  const [inputMode, setInputMode] = useState<'raw' | 'decoded' | 'utf8'>('raw')
  const [isCopied, setIsCopied] = useState(false)
  const {
    push,
    query: { hash, tab = 'erc20', before = null, after = null, address_from = null, address_to = null },
  } = useRouter()
  const [t] = useTranslation('tx')

  const { isLoading: isTransferListLoading, data: transferList } = useQuery(
    ['tx-transfer-list', hash, before, after, address_from, address_to],
    () =>
      fetchTransferList({
        transaction_hash: hash as string,
        before: before as string | null,
        after: after as string | null,
        from_address: address_from as string | null,
        to_address: address_to as string | null,
        combine_from_to: false,
      }),
    {
      enabled: tab === 'erc20',
    },
  )

  const { isLoading: isLogListLoading, data: logsList } = useQuery(
    ['tx-log-list', hash],
    () => fetchEventLogsListByType('txs', hash as string),
    {
      enabled: tab === 'logs',
    },
  )

  const decodedInput = useMemo(() => {
    if (initState.contractAbi && initState.contractAbi.length && initState.input) {
      try {
        const i = new ethers.utils.Interface(initState.contractAbi)
        return i.parseTransaction({ data: initState.input })
      } catch (err) {
        console.error(err)
        return null
      }
    }
    return null
  }, [initState.contractAbi, initState.input])

  const utf8Input = useMemo(() => {
    if (initState.input) {
      try {
        return ethers.utils.toUtf8String(initState.input)
      } catch {
        return null
      }
    }
    return null
  }, [initState.input])

  useEffect(() => {
    setTx(initState)
  }, [setTx, initState])

  useEffect(() => {
    if (decodedInput) {
      setInputMode('decoded')
    }
  }, [decodedInput, setInputMode])

  useWS(
    `${CHANNEL.TX_INFO}${tx.hash}`,
    (init: RawTx) => {
      if (init) {
        setTx(prev => ({ ...getTxRes(init), gasUsed: prev.gasUsed, gasLimit: prev.gasLimit }))
      }
    },
    ({
      status = 'pending',
      l1_block_number,
      polyjuice_status,
    }: Partial<Pick<RawTx, 'status' | 'l1_block_number' | 'polyjuice_status'>>) => {
      setTx(prev => ({
        ...prev,
        status,
        l1BlockNumber: l1_block_number,
        polyjuiceStatus: polyjuice_status ?? prev.polyjuiceStatus,
      }))
    },
    [setTx, tx.hash],
  )

  const handleTxHashCopy = async () => {
    await handleCopy(tx.hash)
    setIsCopied(true)
  }

  const inputContents = [
    { type: 'raw', text: tx.input },
    decodedInput
      ? {
          type: 'decoded',
          text: `Function: ${decodedInput.signature}\n\nMethodID: ${decodedInput.sighash}\n${decodedInput.args
            .map((a, i) => '[' + i + ']: ' + a)
            .join('\n')}`,
        }
      : null,
    utf8Input ? { type: 'utf8', text: utf8Input } : null,
  ].filter(v => v)

  const overview = [
    {
      label: 'hash',
      value: (
        <Tooltip title={tx.hash} placement="top">
          <Stack direction="row" alignItems="center">
            <Typography variant="body2" className="mono-font" overflow="hidden" textOverflow="ellipsis" color="primary">
              {tx.hash}
            </Typography>
            <IconButton aria-label="copy" size="small" onClick={handleTxHashCopy}>
              <CopyIcon fontSize="inherit" />
            </IconButton>
          </Stack>
        </Tooltip>
      ),
    },
    {
      label: 'from',
      value: <Address address={tx.from} />,
    },
    {
      label: tx.toAlias ? 'interactedContract' : 'to',
      value: <Address address={tx.to} alias={tx.toAlias} />,
    },
    tx.contractAddress?.length === ADDR_LENGTH
      ? {
          label: 'deployed_contract',
          value: <Address address={tx.contractAddress} alias={tx.contractAddress} />,
        }
      : null,
    {
      label: 'value',
      // FIXME: tx.value is formatted incorrectly
      value: (
        <Typography variant="body2">{`${new BigNumber(tx.value || '0')
          .multipliedBy(CKB_DECIMAL)
          .dividedBy(GCKB_DECIMAL)
          .toFormat()} CKB`}</Typography>
      ),
    },
  ]
  const basicInfo = [
    tx.polyjuiceStatus === 'succeed'
      ? null
      : {
          label: 'status',
          value:
            tx.polyjuiceStatus === 'failed' ? (
              <Chip icon={<ErrorIcon />} label={t(`failed`)} color="warning" size="small" />
            ) : (
              <Chip icon={<PendingIcon />} label={t(`pending`)} size="small" />
            ),
        },
    { label: 'finalizeState', value: <Typography variant="body2">{t(tx.status)}</Typography> },
    {
      label: 'type',
      value: (
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {tx.type.replace(/_/g, ' ')}
        </Typography>
      ),
    },
    {
      label: 'l1Block',
      value: tx.l1BlockNumber ? (
        <Link
          href={`${CKB_EXPLORER_URL}/block/${tx.l1BlockNumber}`}
          underline="none"
          target="_blank"
          rel="noopener noreferrer"
          display="flex"
          alignItems="center"
          color="secondary"
        >
          {formatInt(tx.l1BlockNumber)}
          <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
        </Link>
      ) : (
        <Typography variant="body2">{t('pending')}</Typography>
      ),
    },
    {
      label: 'l2Block',
      value: tx.blockNumber ? (
        <Typography variant="body2">
          <NextLink href={`/block/${tx.blockNumber}`}>
            <Link href={`/block/${tx.blockNumber}`} underline="none" color="secondary">
              {formatInt(tx.blockNumber)}
            </Link>
          </NextLink>
        </Typography>
      ) : (
        <Typography variant="body2">{t('pending')}</Typography>
      ),
    },
    tx.index !== null ? { label: 'index', value: <Typography variant="body2">{tx.index}</Typography> } : null,
    { label: 'nonce', value: <Typography variant="body2">{Number(tx.nonce).toLocaleString('en')}</Typography> },

    tx.gasPrice
      ? {
          label: 'gasPrice',
          value: (
            <Typography variant="body2" sx={{ textTransform: 'none' }}>
              {new BigNumber(tx.gasPrice).toFormat() + ' pCKB'}
            </Typography>
          ),
        }
      : null,
    tx.gasUsed
      ? {
          label: 'gasUsed',
          value: <Typography variant="body2">{new BigNumber(tx.gasUsed).toFormat()}</Typography>,
        }
      : null,
    tx.gasLimit
      ? {
          label: 'gasLimit',
          value: <Typography variant="body2">{new BigNumber(tx.gasLimit).toFormat()}</Typography>,
        }
      : null,
    tx.gasUsed && tx.gasPrice
      ? {
          label: 'fee',
          value: (
            <Typography variant="body2" sx={{ textTransform: 'none' }}>
              {new BigNumber(tx.gasUsed).times(new BigNumber(tx.gasPrice)).toFormat() + ' pCKB'}
            </Typography>
          ),
        }
      : null,
    {
      label: 'timestamp',
      value: (
        <Typography variant="body2">
          {tx.timestamp >= 0 ? (
            <time dateTime={new Date(tx.timestamp).toISOString()}>{formatDatetime(tx.timestamp)}</time>
          ) : (
            t('pending')
          )}
        </Typography>
      ),
    },
  ]

  const title = t('txInfo')

  return (
    <>
      <SubpageHead subtitle={`${title} ${tx.hash}`} />
      <Container sx={{ pb: 6 }}>
        <PageTitle>{title}</PageTitle>
        <Stack spacing={2}>
          <Paper>
            <Grid container>
              <Grid item xs={12} md={6}>
                <List
                  subheader={<ListSubheader sx={{ bgcolor: 'transparent' }}>{t('overview')}</ListSubheader>}
                  sx={{ textTransform: 'capitalize' }}
                >
                  <Divider variant="middle" />
                  {overview.map(field =>
                    field ? (
                      <ListItem key={field.label}>
                        <ListItemText
                          primary={t(field.label)}
                          secondary={field.value}
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                      </ListItem>
                    ) : null,
                  )}
                  {tx.input ? (
                    <Accordion sx={{ boxShadow: 'none', width: '100%' }}>
                      <AccordionSummary sx={{ textTransform: 'capitalize' }} expandIcon={<ExpandMore />}>
                        {t(`input`)}
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack>
                          <Tabs value={inputMode} onChange={(_, v) => setInputMode(v)}>
                            {inputContents.map(({ type }) => (
                              <Tab
                                key={type}
                                value={type}
                                label={t(`${type}Input`)}
                                disableRipple
                                sx={{ fontSize: 12 }}
                              />
                            ))}
                          </Tabs>
                          <Divider />
                          <Typography
                            variant="body2"
                            component="pre"
                            sx={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap', maxHeight: '51ch', overflow: 'auto' }}
                            p={2}
                            mt={1}
                            border="1px solid"
                            borderColor="primary.light"
                            borderRadius={1}
                            bgcolor={colors.grey[50]}
                            className="mono-font"
                          >
                            {inputContents.find(c => c.type === inputMode)?.text}
                          </Typography>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ) : null}
                  {tx.scriptArgs ? (
                    <Accordion sx={{ boxShadow: 'none', width: '100%' }}>
                      <AccordionSummary sx={{ textTransform: 'capitalize' }} expandIcon={<ExpandMore />}>
                        {t(`args`)}
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography
                          variant="body2"
                          component="pre"
                          sx={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap', maxHeight: '51ch', overflow: 'auto' }}
                          p={2}
                          border="1px solid"
                          borderColor="primary.light"
                          borderRadius={1}
                          bgcolor={colors.grey[50]}
                          className="mono-font"
                        >
                          {tx.scriptArgs}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ) : null}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List
                  subheader={<ListSubheader sx={{ bgcolor: 'transparent' }}>{t('basicInfo')}</ListSubheader>}
                  sx={{ textTransform: 'capitalize' }}
                >
                  <Divider variant="middle" />
                  {basicInfo
                    .filter(v => v)
                    .map(field =>
                      field ? (
                        <ListItem key={field.label}>
                          <ListItemText
                            primary={t(field.label)}
                            secondary={field.value}
                            secondaryTypographyProps={{ component: 'div' }}
                          />
                        </ListItem>
                      ) : null,
                    )}
                </List>
              </Grid>
            </Grid>
          </Paper>
          <Paper>
            <Tabs value={tabs.indexOf(tab as string)} variant="scrollable" scrollButtons="auto">
              {['erc20_records', 'logs'].map((label, idx) => (
                <Tab
                  key={label}
                  label={t(label)}
                  onClick={e => {
                    e.stopPropagation()
                    e.preventDefault()
                    push(`/tx/${tx.hash}?tab=${tabs[idx]}`, undefined, { scroll: false })
                  }}
                />
              ))}
            </Tabs>
            <Divider />
            {tab === 'erc20' ? (
              transferList || !isTransferListLoading ? (
                <TransferList token_transfers={transferList} />
              ) : (
                <Skeleton animation="wave" />
              )
            ) : null}
            {tab === 'logs' ? (
              logsList || !isLogListLoading ? (
                <TxLogsList list={logsList} />
              ) : (
                <Skeleton animation="wave" />
              )
            ) : null}
          </Paper>
        </Stack>
        <Snackbar
          open={isCopied}
          onClose={() => setIsCopied(false)}
          anchorOrigin={{
            horizontal: 'center',
            vertical: 'top',
          }}
          autoHideDuration={3000}
          color="secondary"
        >
          <Alert severity="success" variant="filled">
            {t(`txHashCopied`)}
          </Alert>
        </Snackbar>
      </Container>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: 'blocking',
})

export const getStaticProps: GetStaticProps<State, { hash: string }> = async ({ locale, params }) => {
  const { hash } = params

  try {
    const [tx, lng] = await Promise.all([fetchTx(hash), await serverSideTranslations(locale, ['common', 'tx', 'list'])])
    if (!tx?.hash) {
      throw new NotFoundException()
    }
    return { props: { ...tx, ...lng } }
  } catch (err) {
    return handleApiError(err, null, locale, hash)
  }
}
export default Tx
