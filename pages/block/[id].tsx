import type { GetStaticProps, GetStaticPaths } from 'next'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useQuery } from 'react-query'
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
  Skeleton,
} from '@mui/material'
import { OpenInNew as OpenInNewIcon, ContentCopyOutlined as CopyIcon } from '@mui/icons-material'
import BigNumber from 'bignumber.js'
import SubpageHead from 'components/SubpageHead'
import TxList, { fetchTxList } from 'components/TxList'
import BridgedRecordList from 'components/BridgedRecordList'
import PageTitle from 'components/PageTitle'
import { fetchBlock, formatDatetime, CKB_EXPLORER_URL, formatInt, fetchBridgedRecordList, handleCopy } from 'utils'

const tabs = ['transactions', 'bridged']

const Block = () => {
  const [isCopied, setIsCopied] = useState(false)
  const [t, { language }] = useTranslation('block')
  const {
    replace,
    push,
    query: { id, tab = 'transactions', before = null, after = null, page = '1' },
  } = useRouter()

  const { isLoading: isBlockLoading, data: block } = useQuery(['block', id], () => fetchBlock(id as string), {
    refetchInterval: 10000,
  })

  useEffect(() => {
    if (!isBlockLoading && !block?.hash) {
      replace(`/${language}/404?query=${id}`)
    }
  }, [isBlockLoading, block, replace])

  const { isLoading: isTxListLoading, data: txList } = useQuery(
    ['block-tx-list', block?.number, before, after],
    () =>
      fetchTxList({
        start_block_number: block?.number,
        end_block_number: block?.number,
        before: before as string | null,
        after: after as string | null,
      }),
    {
      enabled: tab === 'transactions' && !!block?.hash,
    },
  )

  const { isLoading: isBridgeListLoading, data: bridgedRecordList } = useQuery(
    ['block-bridge-list', block?.number, page],
    () => fetchBridgedRecordList({ block_number: block?.number.toString(), page: page as string }),
    {
      enabled: tab === 'bridged' && !!block?.hash,
    },
  )

  const handleHashCopy = async () => {
    if (block) {
      await handleCopy(block.hash)
      setIsCopied(true)
    }
  }

  const fields = [
    {
      label: 'hash',
      value: block ? (
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
      ) : (
        <Skeleton animation="wave" />
      ),
    },
    {
      label: 'timestamp',
      value: (
        <Typography variant="body2">
          {block?.timestamp > 0 ? (
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
      value: block?.layer1 ? (
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
          {block ? t(block.finalizeState) : <Skeleton animation="wave" />}
        </Typography>
      ),
    },
    {
      label: 'txCount',
      value: (
        <Typography variant="body2">{block ? formatInt(block.txCount) : <Skeleton animation="wave" />}</Typography>
      ),
    },
    {
      label: 'aggregator',
      value: <Typography variant="body2">{block ? block.miner.hash : <Skeleton animation="wave" />}</Typography>,
    },
    {
      label: 'size',
      value: (
        <Typography variant="body2">
          {block ? new BigNumber(block.size || '0').toFormat() + ' bytes' : <Skeleton animation="wave" />}
        </Typography>
      ),
    },
    {
      label: 'gasUsed',
      value: (
        <Typography variant="body2">
          {block ? new BigNumber(block.gas.used).toFormat() : <Skeleton animation="wave" />}
        </Typography>
      ),
    },
    {
      label: 'gasLimit',
      value: (
        <Typography variant="body2">
          {block ? new BigNumber(block.gas.limit).toFormat() : <Skeleton animation="wave" />}
        </Typography>
      ),
    },
    {
      label: 'parentHash',
      value: block ? (
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
      ) : (
        <Skeleton animation="wave" />
      ),
    },
  ]
  const title = `${t('block')} # ${block ? formatInt(block.number) : ''}`
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
                  <ListItemText
                    primary={t(field.label)}
                    secondary={field.value}
                    secondaryTypographyProps={{ component: 'div' }}
                  />
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
                    if (!block) {
                      return
                    }
                    e.stopPropagation()
                    e.preventDefault()
                    push(`/block/${block.hash}?tab=${tabs[idx]}`, undefined, { scroll: false })
                  }}
                />
              ))}
            </Tabs>
            <Divider />
            {tab === 'transactions' ? (
              !isTxListLoading && txList ? (
                <TxList transactions={txList} />
              ) : (
                <Skeleton animation="wave" />
              )
            ) : null}
            {tab === 'bridged' ? (
              !isBridgeListLoading && bridgedRecordList ? (
                <BridgedRecordList list={bridgedRecordList} showUser />
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
            {t(`blockHashCopied`, { ns: 'common' })}
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common', 'block', 'list'])
  return { props: lng }
}

export default Block
