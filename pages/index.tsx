import type { API } from 'utils/api/utils'
import type { GetStaticProps } from 'next'
import { useEffect, useState } from 'react'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { gql } from 'graphql-request'
import { useQuery } from 'react-query'
import {
  Avatar,
  Link,
  Grid,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Stack,
  Button,
  Divider,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import Search from 'components/Search'
import Tooltip from 'components/Tooltip'
import { fetchHome, timeDistance, formatInt, client, GraphQLSchema, IS_MAINNET } from 'utils'
type State = API.Home.Parsed

// TODO: add polyjuice status
// TODO: how to display special address

const formatAddress = (addr: string, bigScreen: boolean = true) => {
  if (bigScreen && addr.length > 16) {
    return `${addr.slice(0, 8)}...${addr.slice(-7)}`
  }
  if (!bigScreen && addr.length > 8) {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }
  return addr
}

const statisticGroups = [
  { key: 'blockHeight' },
  { key: 'averageBlockTime', suffix: ' s ' },
  { key: 'txCount' },
  { key: 'tps', suffix: ' Txs/s' },
  { key: 'accountCount' },
]

const queryHomeLists = gql`
  query {
    transactions(input: { limit: 10 }) {
      entries {
        eth_hash
        hash
        block {
          timestamp
        }
        from_account {
          eth_address
          script_hash
          type
        }
        to_account {
          eth_address
          script_hash
          type
        }
        polyjuice {
          status
        }
        type
      }
    }
    blocks {
      number
      hash
      timestamp
      status
      transaction_count
    }
  }
`

interface HomeLists {
  blocks: Array<Pick<GraphQLSchema.Block, 'hash' | 'number' | 'status' | 'transaction_count' | 'timestamp'>>
  transactions: {
    entries: Array<{
      block: Pick<GraphQLSchema.Block, 'timestamp'>
      eth_hash: string
      hash: string
      type: GraphQLSchema.TransactionType
      from_account: Pick<GraphQLSchema.Account, 'eth_address' | 'script_hash' | 'type'>
      to_account: Pick<GraphQLSchema.Account, 'eth_address' | 'script_hash' | 'type'>
      polyjuice: Pick<GraphQLSchema.Polyjuice, 'status'>
    }>
  }
}

export const fetchHomeLists = () => client.request<HomeLists>(queryHomeLists)

const Statistic: React.FC<State['statistic'] & { isLoading: boolean }> = ({
  blockCount,
  txCount,
  tps,
  accountCount,
  averageBlockTime,
  isLoading,
}) => {
  const [t] = useTranslation('statistic')
  const [stats, setStats] = useState({
    blockHeight: 0,
    txCount: 0,
    tps: 0,
    accountCount: 0,
    averageBlockTime: 0,
  })

  useEffect(() => {
    if (isLoading) return

    let startTimestamp = null
    const calclateCurValue = (progress: number, end: number, start = 0) => Math.floor(progress * (end - start) + start)
    let reqId: number

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / 2000, 1)

      setStats(start => ({
        blockHeight: calclateCurValue(progress, +blockCount - 1, +start.blockHeight),
        txCount: calclateCurValue(progress, +txCount, +start.txCount),
        tps: calclateCurValue(progress, +tps, +start.tps),
        accountCount: calclateCurValue(progress, +accountCount, +start.accountCount),
        averageBlockTime: calclateCurValue(progress, +averageBlockTime, start.averageBlockTime),
      }))

      if (progress < 1) {
        reqId = requestAnimationFrame(step)
      }
    }
    reqId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(reqId)
  }, [isLoading, blockCount, txCount, tps, accountCount, averageBlockTime])

  return (
    <Grid
      container
      rowSpacing={{ xs: 3, md: 3 }}
      columnSpacing={{ xs: 1, md: 6 }}
      sx={{ maxWidth: { xs: '35%', md: '50%' }, pb: 2, pt: 1 }}
      className="statistic-container"
    >
      {statisticGroups.map((field, i) => (
        <Grid
          item
          key={field.key}
          xs={12}
          md={6}
          lg={i === 0 || i === 2 ? 4.5 : 3.5}
          display="flex"
          justifyContent="left"
          alignItems="center"
        >
          <Stack direction="column" alignItems="left" justifyContent="center" sx={{ my: { md: 4 } }}>
            <Typography
              fontSize={{ xs: 12, md: 16 }}
              fontWeight={{ md: 500 }}
              color="secondary"
              noWrap
              sx={{ textTransform: 'capitalize' }}
            >
              {t(field.key)}
            </Typography>
            {isLoading ? (
              <Skeleton animation="wave" />
            ) : (
              <Typography variant="body1" noWrap fontSize={{ xs: 18, md: 32 }} color="primary" sx={{ fontWeight: 500 }}>
                {stats[field.key].toLocaleString('en')}
                <Typography component="span" fontSize={{ xs: 12, md: 16 }} fontWeight={500}>{`${
                  field.suffix || ''
                }`}</Typography>
              </Typography>
            )}
          </Stack>
        </Grid>
      ))}
    </Grid>
  )
}

const ListContainer = ({ link, title, tooltip, children }) => {
  const [t] = useTranslation(['common'])

  return (
    <Box>
      <Box
        sx={{
          textTransform: 'capitalize',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          ml: '2px',
        }}
      >
        <Typography variant="h6" color="secondary" fontSize={{ xs: 15, md: 20 }}>
          {title}
        </Typography>
        <NextLink href={link} passHref>
          <Tooltip placement="top" title={tooltip}>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Typography variant="body2" fontSize={{ xs: 13, md: 14 }} fontWeight={500} color="primary">
                {t('all')}
              </Typography>
              <ArrowForwardIosRoundedIcon color="primary" sx={{ fontSize: 12, m: '0 2px 1px 2px' }} />
            </Box>
          </Tooltip>
        </NextLink>
      </Box>
      <List
        dense
        component={Paper}
        sx={{
          p: 0,
          mt: 1,
          borderRadius: { xs: '8px', md: '16px' },
          boxShadow: 'none',
          border: '1px solid #f0f0f0',
          overflow: 'hidden',
        }}
        className="list-container"
      >
        {children}
      </List>
    </Box>
  )
}

const BlockAvatar = () => (
  <ListItemIcon sx={{ minWidth: 36 }}>
    <Avatar
      variant="square"
      sx={{
        bgcolor: IS_MAINNET ? '#f6f3ff' : '#f3f8ff',
        color: 'secondary.light',
        width: { xs: 36, md: 56 },
        height: { xs: 36, md: 56 },
        borderRadius: { xs: '4px', md: '12px' },
        fontSize: { xs: 14, md: 16 },
      }}
    >
      Bk
    </Avatar>
  </ListItemIcon>
)

const TxAvatar = () => (
  <ListItemIcon sx={{ minWidth: 36 }}>
    <Avatar
      sx={{
        bgcolor: IS_MAINNET ? '#f6f3ff' : '#f3f8ff',
        color: 'secondary.light',
        width: { xs: 36, md: 56 },
        height: { xs: 36, md: 56 },
        fontSize: { xs: 14, md: 16 },
      }}
    >
      Tx
    </Avatar>
  </ListItemIcon>
)

const BlockList: React.FC<{ list: HomeLists['blocks']; isLoading: boolean }> = ({ list, isLoading }) => {
  const [t, { language }] = useTranslation(['block', 'common'])
  if (isLoading) {
    return (
      <ListContainer title={t(`latestBlocks`)} link="/blocks" tooltip={t(`view_all_blocks`, { ns: 'common' })}>
        {Array.from({ length: 10 }).map((_, idx) => {
          return (
            <Box key={idx}>
              {idx !== 0 && <Divider variant="middle" color="#f0f0f0" sx={{ borderColor: 'transparent' }} />}
              <ListItem>
                <BlockAvatar />
                <ListItemText
                  primary={
                    <Stack direction="column" justifyContent="space-around" ml={2} sx={{ height: { xs: 52, md: 88 } }}>
                      <Skeleton animation="wave" height="24.5px" />
                      <Skeleton animation="wave" height="24.5px" />
                    </Stack>
                  }
                  primaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
            </Box>
          )
        })}
      </ListContainer>
    )
  }

  return (
    <ListContainer title={t(`latestBlocks`)} link="/blocks" tooltip={t(`view_all_blocks`, { ns: 'common' })}>
      {list?.map((block, idx) => (
        <Stack key={block.hash} sx={{ '& :hover': { backgroundColor: 'primary.light' } }}>
          {idx !== 0 && <Divider variant="middle" color="#f0f0f0" sx={{ borderColor: 'transparent' }} />}
          <ListItem>
            <BlockAvatar />
            <ListItemText
              primary={
                <Stack direction="row" alignItems="center" sx={{ height: { xs: 52, md: 88 } }}>
                  <Stack
                    flexGrow={1}
                    px={{ xs: 1, md: 2 }}
                    justifyContent={{ xs: 'center', md: 'space-between' }}
                    height={{ xs: 36, md: 56 }}
                  >
                    <Box>
                      <NextLink href={`/block/${block.hash}`} passHref>
                        <Button
                          color="primary"
                          href={`/block/${block.hash}`}
                          component={Link}
                          sx={{ 'fontSize': 14, 'p': 0, 'lineHeight': 1.5, '&:hover': { backgroundColor: 'unset' } }}
                          disableRipple
                          title="block number"
                        >
                          {`# ${formatInt(block.number)}`}
                        </Button>
                      </NextLink>
                    </Box>
                    <Tooltip title={block.hash} className="mono-font" hidden>
                      <Box
                        component="span"
                        sx={{
                          'overflow': 'hidden',
                          'textOverflow': 'ellipsis',
                          '&:hover': { backgroundColor: 'unset' },
                        }}
                        className="mono-font"
                        px={1}
                      >
                        {block.hash}
                      </Box>
                    </Tooltip>
                    <Box alignItems="bottom" fontWeight={400} fontSize={{ xs: 12, md: 14 }} color="secondary.light">
                      <time
                        dateTime={new Date(block.timestamp).toISOString()}
                        title={new Date(block.timestamp).toISOString()}
                      >
                        {timeDistance(block.timestamp, language)}
                      </time>
                    </Box>
                  </Stack>
                  <Typography
                    variant="body2"
                    display="flex"
                    alignItems="center"
                    fontSize={{ xs: 13, md: 16 }}
                    fontWeight={500}
                  >
                    {formatInt(block.transaction_count)} Txs
                  </Typography>
                </Stack>
              }
              primaryTypographyProps={{ component: 'div' }}
            />
          </ListItem>
        </Stack>
      ))}
    </ListContainer>
  )
}

const SPECIAL_ADDR_TYPES = [
  GraphQLSchema.AccountType.EthAddrReg,
  GraphQLSchema.AccountType.MetaContract,
  GraphQLSchema.AccountType.PolyjuiceCreator,
]

const TxList: React.FC<{ list: HomeLists['transactions']['entries']; isLoading: boolean }> = ({ list, isLoading }) => {
  const [t, { language }] = useTranslation('tx')
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.up('sm'))
  if (isLoading) {
    return (
      <ListContainer title={t(`latestTxs`)} link="/txs" tooltip={t(`view_all_transactions`, { ns: 'common' })}>
        {Array.from({ length: 10 }).map((_, idx) => {
          return (
            <Box key={idx}>
              {idx !== 0 && <Divider variant="middle" color="#f0f0f0" sx={{ borderColor: 'transparent' }} />}
              <ListItem>
                <TxAvatar />
                <ListItemText
                  primary={
                    <Stack direction="column" justifyContent="space-around" ml={2} sx={{ height: { xs: 52, md: 88 } }}>
                      <Skeleton animation="wave" height="24.5px" />
                      <Skeleton animation="wave" height="24.5px" />
                    </Stack>
                  }
                  primaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
            </Box>
          )
        })}
      </ListContainer>
    )
  }
  return (
    <ListContainer title={t(`latestTxs`)} link="/txs" tooltip={t(`view_all_transactions`, { ns: 'common' })}>
      {list?.map((tx, idx) => {
        const hash = tx.eth_hash ?? tx.hash
        const from = tx.from_account.eth_address || tx.from_account.script_hash
        const to = tx.to_account.eth_address || tx.to_account.script_hash
        const isSpecialFrom = SPECIAL_ADDR_TYPES.includes(tx.from_account.type)
        const isSpecialTo = SPECIAL_ADDR_TYPES.includes(tx.to_account.type)
        return (
          <Box key={hash} sx={{ '& :hover': { backgroundColor: 'primary.light' } }}>
            {idx !== 0 && <Divider variant="middle" color="#f0f0f0" sx={{ borderColor: 'transparent' }} />}
            <ListItem>
              <TxAvatar />
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" sx={{ height: { xs: 52, md: 88 } }}>
                    <Stack
                      flexGrow={1}
                      px={{ xs: 1, md: 2 }}
                      justifyContent={{ xs: 'center', md: 'space-between' }}
                      height={{ xs: 36, md: 56 }}
                    >
                      <Tooltip title={hash} className="mono-font">
                        <Box sx={{ width: 'min-content' }}>
                          <NextLink href={`/tx/${hash}`} passHref>
                            <Button
                              title="tx hash"
                              color="primary"
                              href={`/tx/${hash}`}
                              component={Link}
                              className="mono-font"
                              disableRipple
                              fontSize={{ xs: 13, md: 14 }}
                              sx={{
                                'textTransform': 'lowercase',
                                'whiteSpace': 'nowrap',
                                'fontSize': 14,
                                'p': 0,
                                'lineHeight': 1.5,
                                '&:hover': { backgroundColor: 'unset' },
                              }}
                            >
                              {formatAddress(hash, matches)}
                            </Button>
                          </NextLink>
                        </Box>
                      </Tooltip>
                      <Box
                        alignItems="bottom"
                        fontWeight={400}
                        fontSize={{ xs: 12, md: 14 }}
                        pt={0.5}
                        color="secondary.light"
                      >
                        <time dateTime={new Date(tx.block.timestamp).toISOString()} title={t('timestamp')}>
                          {timeDistance(tx.block.timestamp, language)}
                        </time>
                      </Box>
                    </Stack>
                    <Stack
                      height={{ xs: 36, md: 56 }}
                      sx={{ pl: { xs: 1, sm: 0 } }}
                      justifyContent={{ xs: 'center', md: 'space-between' }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography
                          fontSize={{ xs: 12, md: 14 }}
                          sx={{ textTransform: 'capitalize' }}
                          color="secondary"
                          noWrap
                        >
                          {`${t('from')}:`}
                        </Typography>
                        <Tooltip title={from} className="mono-font">
                          <Box>
                            <NextLink href={`/account/${from}`} passHref>
                              <Button
                                title="from"
                                color="primary"
                                href={`/account/${from}`}
                                component={Link}
                                className="mono-font"
                                disableRipple
                                fontSize={{ xs: 13, md: 14 }}
                                sx={{
                                  'p': 0,
                                  'pl': 1,
                                  'textTransform': isSpecialFrom ? 'uppercase' : 'lowercase',
                                  '&:hover': { backgroundColor: 'unset' },
                                  'whiteSpace': 'nowrap',
                                }}
                              >
                                {isSpecialFrom ? tx.from_account.type.replace(/_/g, ' ') : formatAddress(from, matches)}
                              </Button>
                            </NextLink>
                          </Box>
                        </Tooltip>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography
                          fontSize={{ xs: 12, md: 14 }}
                          sx={{ textTransform: 'capitalize' }}
                          color="secondary"
                          noWrap
                        >
                          {`${t('to')}:`}
                        </Typography>
                        <Tooltip title={to} className="mono-font">
                          <Box>
                            <NextLink href={`/account/${to}`} passHref>
                              <Button
                                title="to"
                                color="primary"
                                href={`/account/${to}`}
                                component={Link}
                                className="mono-font"
                                disableRipple
                                fontSize={{ xs: 13, md: 14 }}
                                sx={{
                                  'p': 0,
                                  'pl': 1,
                                  'textTransform': isSpecialFrom ? 'uppercase' : 'lowercase',
                                  '&:hover': { backgroundColor: 'unset' },
                                  'whiteSpace': 'nowrap',
                                }}
                              >
                                {isSpecialTo ? tx.to_account.type.replace(/_/g, ' ') : formatAddress(to, matches)}
                              </Button>
                            </NextLink>
                          </Box>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Stack>
                }
                primaryTypographyProps={{ component: 'div' }}
              />
            </ListItem>
          </Box>
        )
      })}
    </ListContainer>
  )
}

const INTERVAL = 5000

const Home = () => {
  const { isLoading: isStaticsLoading, data: staticsData } = useQuery('home', () => fetchHome(), {
    refetchInterval: INTERVAL,
  })
  const { isLoading: isListsLoading, data: lists } = useQuery('home-lists', () => fetchHomeLists(), {
    refetchInterval: INTERVAL,
  })

  return (
    <Box sx={{ pb: { xs: 5, md: 11 } }}>
      <Box sx={{ bgcolor: 'primary.light' }}>
        <Container sx={{ px: { md: 3, lg: 1 } }}>
          <Search />
        </Container>
        <Container sx={{ px: { md: 3, lg: 1 }, pr: { xs: 0 } }}>
          <Stack direction="row" sx={{ pt: 2.5, pb: 1 }} justifyContent="space-between" alignItems="center">
            <Statistic {...staticsData?.statistic} isLoading={isStaticsLoading} />
            <video
              autoPlay
              playsInline
              webkit-playsinline="true"
              loop
              muted
              preload="auto"
              x5-video-player-type="h5"
              x5-video-player-fullscreen="true"
              style={{ maxWidth: '78%', width: 'auto', height: 'auto', maxHeight: 444 }}
            >
              <source src={IS_MAINNET ? '/home-video.mp4' : '/testnet-home-video.mp4'} />
            </video>
          </Stack>
        </Container>
      </Box>
      <Container sx={{ px: { md: 2, lg: 1 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'column', md: 'column', lg: 'row' }}
          spacing={4}
          sx={{ pt: { xs: 3, md: 8 } }}
        >
          <Box sx={{ width: '100%', lg: { width: '50%', mr: 2 } }} className="latest-blocks">
            <BlockList list={lists?.blocks ?? []} isLoading={isListsLoading} />
          </Box>
          <Box sx={{ width: '100%', lg: { width: '50%', ml: 2 } }} className="latest-txs">
            <TxList list={lists?.transactions.entries ?? []} isLoading={isListsLoading} />
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const lng = await serverSideTranslations(locale, ['common', 'block', 'tx', 'statistic'])
  return { props: lng }
}

export default Home
