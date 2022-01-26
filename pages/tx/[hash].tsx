import { useEffect, useState, useMemo } from 'react'
import { GetServerSideProps } from 'next'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import {
  Avatar,
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
} from '@mui/material'
import {
  OpenInNew as OpenInNewIcon,
  ContentCopyOutlined as CopyIcon,
  ErrorOutlineOutlined as ErrorIcon,
} from '@mui/icons-material'
import { ExpandMore } from '@mui/icons-material'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import SubpageHead from 'components/SubpageHead'
import PageTitle from 'components/PageTitle'
import Address from 'components/AddressInHalfPanel'
import {
  formatDatetime,
  fetchTx,
  handleApiError,
  useWS,
  getTxRes,
  CKB_EXPLORER_URL,
  CHANNEL,
  formatInt,
  handleCopy,
  CKB_DECIMAL,
  nameToColor,
} from 'utils'

type RawTx = Parameters<typeof getTxRes>[0]
type ParsedTx = ReturnType<typeof getTxRes>

type State = ParsedTx

const Tx = (initState: State) => {
  const [tx, setTx] = useState(initState)
  const [inputMode, setInputMode] = useState<'raw' | 'decoded' | 'utf8'>('raw')
  const [isCopied, setIsCopied] = useState(false)
  const [t] = useTranslation('tx')

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
    ({ status = 'pending', l1_block_number }: Partial<Pick<RawTx, 'status' | 'l1_block_number'>>) => {
      setTx(prev => ({ ...prev, status, l1BlockNumber: l1_block_number }))
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
      label: tx.receiveEthAddress ? 'interactedContract' : 'to',
      value: <Address address={tx.to} alias={tx.toAlias} />,
    },
    {
      label: 'value',
      value: (
        <Typography variant="body2">{`${new BigNumber(tx.value || '0')
          .dividedBy(CKB_DECIMAL)
          .toString()} CKB`}</Typography>
      ),
    },
    // tx.receiveEthAddress
    //   ? {
    //       label: 'erc20Receiver',
    //       value: <Address address={tx.receiveEthAddress} />,
    //     }
    //   : null,
    tx.receiveEthAddress
      ? {
          label: 'erc20Receiver',
          value: <Address address={tx.receiveEthAddress} />,
        }
      : null,
    tx.transferValue
      ? {
          label: 'erc20Value',
          value: (
            <Stack direction="row" alignItems="center" color="inherit">
              <Avatar
                src={tx.udtIcon ?? null}
                sx={{ bgcolor: nameToColor(tx.udtSymbol), width: 20, height: 20, fontSize: 12, mr: 1 }}
              >
                {tx.udtSymbol?.[0] ?? '?'}
              </Avatar>
              <Typography variant="body2" color="#000000de">{`${new BigNumber(tx.transferValue || '0').toString()} ${
                tx.udtSymbol
              }`}</Typography>
            </Stack>
          ),
        }
      : null,
  ]
  const basicInfo = [
    tx.isSuccess
      ? null
      : {
          label: 'status',
          value: <Chip icon={<ErrorIcon />} label={t(`failed`)} color="warning" size="small" />,
        },
    { label: 'finalizeState', value: <Typography variant="body2">{t(tx.status)}</Typography> },
    { label: 'type', value: <Typography variant="body2">{tx.type.replace(/_/g, ' ')}</Typography> },
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
    { label: 'nonce', value: <Typography variant="body2">{Number(tx.nonce).toLocaleString('en')}</Typography> },

    tx.gasPrice
      ? {
          label: 'gasPrice',
          value: (
            <Typography variant="body2">
              {new BigNumber(tx.gasPrice).dividedBy(new BigNumber(CKB_DECIMAL)).toFormat() + ' CKB'}
            </Typography>
          ),
        }
      : null,
    tx.gasUsed
      ? {
          label: 'gasUsed',
          value: <Typography variant="body2">{Number(tx.gasUsed).toLocaleString('en')}</Typography>,
        }
      : null,
    tx.gasLimit
      ? {
          label: 'gasLimit',
          value: <Typography variant="body2">{Number(tx.gasLimit).toLocaleString('en')}</Typography>,
        }
      : null,
    tx.gasUsed && tx.gasPrice
      ? {
          label: 'fee',
          value: (
            <Typography variant="body2">
              {new BigNumber(tx.gasUsed)
                .times(new BigNumber(tx.gasPrice))
                .dividedBy(new BigNumber(CKB_DECIMAL))
                .toFormat() + ' CKB'}
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
                      <ListItemText primary={t(field.label)} secondary={field.value} />
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
                        <ListItemText primary={t(field.label)} secondary={field.value} />
                      </ListItem>
                    ) : null,
                  )}
              </List>
            </Grid>
          </Grid>
        </Paper>
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

export const getServerSideProps: GetServerSideProps<State, { hash: string }> = async ({ locale, res, params }) => {
  const { hash } = params

  try {
    const tx = await fetchTx(hash)
    const lng = await serverSideTranslations(locale, ['common', 'tx'])
    return { props: { ...tx, ...lng } }
  } catch (err) {
    return handleApiError(err, res, locale, hash)
  }
}
export default Tx
