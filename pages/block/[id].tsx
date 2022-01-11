import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Container, List, ListItem, ListItemText, Typography, Paper, Link } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PageTitle from 'components/PageTitle'
import {
  fetchBlock,
  handleApiError,
  API,
  formatDatetime,
  useWS,
  getBlockRes,
  CKB_EXPLORER_URL,
  CHANNEL,
  formatInt,
} from 'utils'

type State = API.Block.Parsed

const Block = (initState: State) => {
  const [block, setBlock] = useState(initState)
  const [t] = useTranslation('block')

  useEffect(() => {
    setBlock(initState)
  }, [setBlock, initState])

  useWS(
    `${CHANNEL.BLOCK_INFO}${block.number}`,
    (init: API.Block.Raw) => {
      setBlock(getBlockRes(init))
    },
    ({
      l1_block,
      tx_hash,
      finalize_state,
    }: Partial<Pick<API.Block.Raw, 'l1_block' | 'tx_hash' | 'finalize_state'>>) => {
      let update: Partial<Pick<API.Block.Parsed, 'l1Block' | 'txHash' | 'finalizeState'>> = {}
      if (l1_block) {
        update.l1Block = l1_block
      }
      if (tx_hash) {
        update.txHash = tx_hash
      }
      if (finalize_state) {
        update.finalizeState = finalize_state
      }
      setBlock(prev => ({ ...prev, ...update }))
    },
    [setBlock, block.number],
  )

  const fields = [
    {
      label: 'timestamp',
      value: (
        <Typography variant="body2">
          <time dateTime={new Date(block.timestamp).toISOString()} title={t('timestamp')}>
            {formatDatetime(block.timestamp)}
          </time>
        </Typography>
      ),
    },
    {
      label: 'l1Block',
      value: (
        <Typography variant="body2">
          {block.l1Block ? (
            <Link
              href={`${CKB_EXPLORER_URL}/block/${block.l1Block}`}
              underline="none"
              target="_blank"
              rel="noopener noreferrer"
              display="flex"
              alignItems="center"
              color="secondary"
            >
              {formatInt(block.l1Block)}
              <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
            </Link>
          ) : (
            t('pending')
          )}
        </Typography>
      ),
    },
    {
      label: 'l1TxHash',
      value: (
        <Typography variant="body2">
          {block.txHash ? (
            <Link
              href={`${CKB_EXPLORER_URL}/transaction/${block.txHash}`}
              underline="none"
              target="_blank"
              rel="noopener noreferrer"
              display="flex"
              alignItems="center"
              color="secondary"
            >
              <Typography variant="body2" overflow="hidden" textOverflow="ellipsis" className="mono-font">
                {block.txHash}
              </Typography>
              <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
            </Link>
          ) : (
            t('pending')
          )}
        </Typography>
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
      value: <Typography variant="body2">{block.aggregator}</Typography>,
    },
  ]
  return (
    <Container sx={{ py: 6 }}>
      <PageTitle>{`${t('block')} # ${formatInt(block.number)}`}</PageTitle>
      <Paper>
        <List sx={{ textTransform: 'capitalize' }}>
          {fields.map(field => (
            <ListItem key={field.label}>
              <ListItemText primary={t(field.label)} secondary={field.value} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ locale, res, params }) => {
  const { id } = params
  try {
    const block = await fetchBlock(id as string)
    const lng = await serverSideTranslations(locale, ['common', 'block'])
    return { props: { ...block, ...lng } }
  } catch (err) {
    return handleApiError(err, res, locale, id.toString())
  }
}

export default Block
