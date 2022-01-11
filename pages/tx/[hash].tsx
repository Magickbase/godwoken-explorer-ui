import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import {
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
} from '@mui/material'
import { OpenInNew as OpenInNewIcon, ContentCopyOutlined as CopyIcon } from '@mui/icons-material'
import { ExpandMore } from '@mui/icons-material'
import PageTitle from 'components/PageTitle'
import Address from 'components/AddressInHalfPanel'
import {
  formatDatetime,
  fetchTx,
  API,
  handleApiError,
  useWS,
  getTxRes,
  CKB_EXPLORER_URL,
  CHANNEL,
  formatInt,
  handleCopy,
} from 'utils'
type State = API.Tx.Parsed

const Tx = (initState: State) => {
  const [tx, setTx] = useState(initState)
  const [isCopied, setIsCopied] = useState(false)
  const [t] = useTranslation('tx')

  useEffect(() => {
    setTx(initState)
  }, [setTx, initState])

  useWS(
    `${CHANNEL.TX_INFO}${tx.hash}`,
    (init: API.Tx.Raw) => {
      if (init) {
        setTx(getTxRes(init))
      }
    },
    ({ l1_block, finalize_state }: Partial<Pick<API.Tx.Raw, 'l1_block' | 'finalize_state'>>) => {
      const update: Partial<Pick<API.Tx.Parsed, 'l1Block' | 'finalizeState'>> = {}
      if (l1_block) {
        update.l1Block = l1_block
      }
      if (finalize_state) {
        update.finalizeState = finalize_state
      }
      setTx(prev => ({ ...prev, ...update }))
    },
    [setTx, tx.hash],
  )

  const handleTxHashCopy = async () => {
    await handleCopy(tx.hash)
    setIsCopied(true)
  }

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
      label: 'to',
      value: <Address address={tx.to} />,
    },
  ]
  const basicInfo = [
    { label: 'finalizeState', value: <Typography variant="body2">{t(tx.finalizeState)}</Typography> },
    { label: 'type', value: <Typography variant="body2">{tx.type}</Typography> },
    {
      label: 'l1Block',
      value: tx.l1Block ? (
        <Link
          href={`${CKB_EXPLORER_URL}/block/${tx.l1Block}`}
          underline="none"
          target="_blank"
          rel="noopener noreferrer"
          display="flex"
          alignItems="center"
          color="secondary"
        >
          {formatInt(tx.l1Block)}
          <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
        </Link>
      ) : (
        <Typography variant="body2">{t('pending')}</Typography>
      ),
    },
    {
      label: 'l2Block',
      value: tx.l2Block ? (
        <Typography variant="body2">
          <NextLink href={`/block/${tx.l2Block}`}>
            <Link href={`/block/${tx.l2Block}`} underline="none" color="secondary">
              {formatInt(tx.l2Block)}
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
          value: <Typography variant="body2">{Number(tx.gasPrice).toLocaleString('en') + ' shannon'}</Typography>,
        }
      : null,
    { label: 'fee', value: <Typography variant="body2">{Number(tx.fee).toLocaleString('en')}</Typography> },
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

  return (
    <Container sx={{ pb: 6 }}>
      <PageTitle>{t('txInfo')}</PageTitle>
      <Paper>
        <Grid container>
          <Grid item xs={12} md={6}>
            <List
              subheader={<ListSubheader sx={{ bgcolor: 'transparent' }}>{t('overview')}</ListSubheader>}
              sx={{ textTransform: 'capitalize' }}
            >
              <Divider variant="middle" />
              {overview.map(field => (
                <ListItem key={field.label}>
                  <ListItemText primary={t(field.label)} secondary={field.value} />
                </ListItem>
              ))}
              {tx.args ? (
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
                      {tx.args}
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
              {basicInfo.map(field =>
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
