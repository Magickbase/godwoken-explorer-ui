import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { utils } from 'ethers'
import {
  Alert,
  Container,
  Stack,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  Link,
  Tabs,
  Tab,
  Tooltip,
  Divider,
  IconButton,
  Snackbar,
} from '@mui/material'
import { OpenInNew as OpenInNewIcon, ContentCopyOutlined as CopyIcon } from '@mui/icons-material'
import BigNumber from 'bignumber.js'
import SubpageHead from 'components/SubpageHead'
import TxList from 'components/TxList'
import BridgedRecordList from 'components/BridgedRecordList'
import PageTitle from 'components/PageTitle'
import {
  fetchBlock,
  handleApiError,
  formatDatetime,
  useWS,
  getBlockRes,
  CKB_EXPLORER_URL,
  CHANNEL,
  PAGE_SIZE,
  formatInt,
  fetchTxList,
  getTxListRes,
  fetchBridgedRecordList,
  getBridgedRecordListRes,
  handleCopy,
  TabNotFoundException,
  GAS_UNIT,
} from 'utils'

type RawBlock = Parameters<typeof getBlockRes>[0]
type ParsedBlock = ReturnType<typeof getBlockRes>
type ParsedTxList = ReturnType<typeof getTxListRes>
type ParsedBridgedRecordList = ReturnType<typeof getBridgedRecordListRes>

const tabs = ['transactions', 'bridged']

type State = ParsedBlock & Partial<{ txList: ParsedTxList; bridgedRecordList: ParsedBridgedRecordList }>

const Block = (initState: State) => {
  const [block, setBlock] = useState(initState)
  const [isCopied, setIsCopied] = useState(false)
  const [t, { language }] = useTranslation('block')
  const {
    push,
    query: { tab = 'transactions' },
  } = useRouter()

  useEffect(() => {
    setBlock(initState)
  }, [setBlock, initState])

  useWS(
    `${CHANNEL.BLOCK_INFO}${block.number}`,
    (init: RawBlock) => {
      // setBlock(prev => ({ ...prev, ...getBlockRes(init) }))
    },
    (rawUpdate: RawBlock) => {
      const update = getBlockRes(rawUpdate)
      setBlock(prev => ({ ...prev, ...update }))
    },
    [setBlock, block.number],
  )

  const handleHashCopy = async () => {
    await handleCopy(block.hash)
    setIsCopied(true)
  }

  const fields = [
    {
      label: 'hash',
      value: (
        <Stack direction="row" alignItems="center">
          <Tooltip title={block.hash} placement="top">
            <Typography
              variant="body2"
              className="mono-font"
              overflow="hidden"
              textOverflow="ellipsis"
              color="#000000de"
            >
              {block.hash}
            </Typography>
          </Tooltip>
          <IconButton aria-label="copy" size="small" onClick={handleHashCopy}>
            <CopyIcon fontSize="inherit" />
          </IconButton>
        </Stack>
      ),
    },
    {
      label: 'timestamp',
      value: (
        <Typography variant="body2">
          {block.timestamp > 0 ? (
            <time dateTime={new Date(block.timestamp).toISOString()} title={t('timestamp')}>
              {formatDatetime(block.timestamp)}
            </time>
          ) : (
            t('pending')
          )}
        </Typography>
      ),
    },
    {
      label: 'layer1Info',
      value: block.layer1 ? (
        <Stack sx={{ whiteSpace: 'nowrap', flexDirection: { xs: 'column', md: 'row' } }} color="#000000de">
          {language === 'zh-CN' ? (
            <>
              <Stack direction="row">
                <Typography variant="body2">区块</Typography>
                <Link
                  href={`${CKB_EXPLORER_URL}/block/${block.layer1.block}`}
                  underline="none"
                  target="_blank"
                  rel="noopener noreferrer"
                  display="flex"
                  alignItems="center"
                  color="secondary"
                  mx={1}
                >
                  {formatInt(block.layer1.block)}
                  <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
                </Link>
                中的
              </Stack>
              <Stack direction="row">
                交易
                <Link
                  href={`${CKB_EXPLORER_URL}/transaction/${block.layer1.txHash}`}
                  underline="none"
                  target="_blank"
                  rel="noopener noreferrer"
                  display="flex"
                  alignItems="center"
                  color="secondary"
                  ml={1}
                  width={{ xs: 'calc(100% - 40px)', md: 'unset' }}
                >
                  <Typography variant="body2" overflow="hidden" textOverflow="ellipsis" className="mono-font">
                    {block.layer1.txHash}
                  </Typography>
                  <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
                </Link>
              </Stack>
            </>
          ) : (
            <>
              <Stack direction="row" alignItems="center">
                Transaction
                <Link
                  href={`${CKB_EXPLORER_URL}/transaction/${block.layer1.txHash}`}
                  underline="none"
                  target="_blank"
                  rel="noopener noreferrer"
                  display="flex"
                  alignItems="center"
                  color="secondary"
                  mx={1}
                  width={{ xs: 'calc(100% - 90px)', md: 'unset' }}
                >
                  <Typography variant="body2" overflow="hidden" textOverflow="ellipsis" className="mono-font">
                    {block.layer1.txHash}
                  </Typography>
                  <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
                </Link>
              </Stack>
              <Stack direction="row" alignItems="center">
                in block
                <Link
                  href={`${CKB_EXPLORER_URL}/block/${block.layer1.block}`}
                  underline="none"
                  target="_blank"
                  rel="noopener noreferrer"
                  display="flex"
                  alignItems="center"
                  color="secondary"
                  ml={1}
                >
                  {formatInt(block.layer1.block)}
                  <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
                </Link>
              </Stack>
            </>
          )}
        </Stack>
      ) : (
        <Typography variant="body2">{t('pending')}</Typography>
      ),
    },
    {
      label: 'finalizeState',
      value: (
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {t(block.finalizeState)}
        </Typography>
      ),
    },
    {
      label: 'txCount',
      value: <Typography variant="body2">{formatInt(block.txCount)}</Typography>,
    },
    {
      label: 'aggregator',
      value: <Typography variant="body2">{block.miner.hash}</Typography>,
    },
    {
      label: 'size',
      value: <Typography variant="body2">{new BigNumber(block.size || '0').toFormat() + ' bytes'}</Typography>,
    },
    {
      label: 'gasUsed',
      value: <Typography variant="body2">{`${utils.formatUnits(block.gas.used, GAS_UNIT)} ${GAS_UNIT}`}</Typography>,
    },
    {
      label: 'gasLimit',
      value: <Typography variant="body2">{`${utils.formatUnits(block.gas.limit, GAS_UNIT)} ${GAS_UNIT}`}</Typography>,
    },
    {
      label: 'parentHash',
      value: (
        <Tooltip title={block.parentHash} placement="top">
          <Typography
            variant="body2"
            overflow="hidden"
            textOverflow="ellipsis"
            sx={{ width: 'fit-content', maxWidth: '100%' }}
          >
            <NextLink href={`/block/${block.parentHash}`}>
              <Link href={`/block/${block.parentHash}`} underline="none" color="secondary">
                {block.parentHash}
              </Link>
            </NextLink>
          </Typography>
        </Tooltip>
      ),
    },
  ]
  const title = `${t('block')} # ${formatInt(block.number)}`
  return (
    <>
      <SubpageHead subtitle={title} />
      <Container sx={{ py: 6 }}>
        <PageTitle>{title}</PageTitle>
        <Stack spacing={2}>
          <Paper>
            <List sx={{ textTransform: 'capitalize' }}>
              {fields.map(field => (
                <ListItem key={field.label}>
                  <ListItemText primary={t(field.label)} secondary={field.value} />
                </ListItem>
              ))}
            </List>
          </Paper>
          <Paper>
            <Tabs value={tabs.indexOf(tab as string)} variant="scrollable" scrollButtons="auto">
              {[t('transactionRecords'), t(`bridgedRecords`)].map((label, idx) => (
                <Tab
                  key={label}
                  label={label}
                  onClick={e => {
                    e.stopPropagation()
                    e.preventDefault()
                    push(`/block/${block.hash}?tab=${tabs[idx]}`, undefined, { scroll: false })
                  }}
                />
              ))}
            </Tabs>
            <Divider />
            {tab === 'transactions' && block.txList ? <TxList list={block.txList} pageSize={PAGE_SIZE} /> : null}
            {tab === 'bridged' && block.bridgedRecordList ? (
              <BridgedRecordList list={block.bridgedRecordList} showUser />
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
            {t(`blockHashCopied`, { ns: 'common' })}
          </Alert>
        </Snackbar>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ locale, res, params, query }) => {
  const { id } = params
  const { tab = tabs[0] } = query
  try {
    if (typeof tab !== 'string' || !tabs.includes(tab)) {
      throw new TabNotFoundException()
    }

    const [block, lng] = await Promise.all([
      fetchBlock(id as string),
      serverSideTranslations(locale, ['common', 'block', 'list']),
    ])

    const txList =
      tab === 'transactions' && block.hash
        ? await fetchTxList({ block_hash: block.hash, page: query.page as string })
        : null

    const bridgedRecordList =
      tab === 'bridged' && block.hash
        ? await fetchBridgedRecordList({ block_number: block.number.toString(), page: query.page as string })
        : null

    return { props: { ...block, ...lng, txList, bridgedRecordList } }
  } catch (err) {
    return handleApiError(err, res, locale, id.toString())
  }
}

export default Block
