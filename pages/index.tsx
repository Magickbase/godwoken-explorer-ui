import { useState } from 'react'
import { GetServerSideProps } from 'next'
import NextLink from 'next/link'
import {
  Avatar,
  Link,
  Grid,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Box,
  Stack,
  Button,
  Tooltip,
  Chip,
  Divider,
  Paper,
} from '@mui/material'
import {
  LineWeightOutlined as BlockHeightIcon,
  AccountBoxOutlined as AccountCountIcon,
  SpeedOutlined as TpsIcon,
  FormatListNumberedOutlined as TxCountIcon,
  ErrorOutlineOutlined as ErrorIcon,
} from '@mui/icons-material'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { timeDistance, fetchHome, API, handleApiError, useWS, CHANNEL, getHomeRes, formatInt } from 'utils'
import { Typography } from '@mui/material'

type State = API.Home.Parsed

const formatAddress = (addr: string) => {
  if (addr.length > 13) {
    return `${addr.substr(0, 7)}...${addr.slice(-5)}`
  }
  return addr
}

const statisticGroups = [
  { key: 'blockHeight', icon: <BlockHeightIcon />, prefix: '# ' },
  { key: 'txCount', icon: <TxCountIcon /> },
  { key: 'tps', icon: <TpsIcon />, suffix: 'tx/s' },
  { key: 'accountCount', icon: <AccountCountIcon /> },
]

const Statistic = ({ blockCount, txCount, tps, accountCount }: State['statistic']) => {
  const [t] = useTranslation('statistic')
  const stats = {
    blockHeight: +blockCount ? (+blockCount - 1).toLocaleString('en') : '-',
    txCount: (+txCount).toLocaleString('en'),
    tps: (+tps).toLocaleString('en'),
    accountCount: (+accountCount).toLocaleString('en'),
  }

  return (
    <Grid container spacing={2}>
      {statisticGroups.map(field => (
        <Grid item key={field.key} xs={6} md={3}>
          <Paper sx={{ bgcolor: 'primary.light', color: 'white', p: 5, textAlign: 'center' }}>
            <Stack direction="row" display="flex" alignItems="center" justifyContent="center">
              {field.icon}
              <Typography variant="body2" noWrap sx={{ textTransform: 'capitalize', pl: 1 }}>
                {t(field.key)}
              </Typography>
            </Stack>
            <Typography variant="body1" noWrap>
              {`${field.prefix || ''}${stats[field.key]}${field.suffix || ''}`}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}

const BlockList = ({ list }: { list: State['blockList'] }) => {
  const [t, { language }] = useTranslation('block')
  return (
    <List
      subheader={
        <ListSubheader component="div" sx={{ textTransform: 'capitalize', bgcolor: 'transparent' }}>
          {t(`latestBlocks`)}
        </ListSubheader>
      }
    >
      {list.map((block, idx) => (
        <Box key={block.hash}>
          <Divider variant={idx ? 'middle' : 'fullWidth'} />
          <ListItem>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: '#cfd8dc' }}>Bk</Avatar>
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack minHeight={73}>
                  <Stack direction="row" justifyContent="space-between">
                    <Box>
                      <NextLink href={`/block/${block.hash}`}>
                        <Button color="secondary" href={`/block/${block.hash}`} component={Link}>
                          {`# ${formatInt(block.number)}`}
                        </Button>
                      </NextLink>
                    </Box>
                    <Typography variant="body2" display="flex" alignItems="center">
                      {formatInt(block.txCount)} TXs
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Tooltip placement="top" title={block.hash} hidden>
                      <Box
                        component="span"
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        className="mono-font"
                        px={1}
                      >
                        {block.hash}
                      </Box>
                    </Tooltip>
                    <Box alignItems="bottom" fontWeight={400} fontSize="0.875rem" pt={1} ml={1} color="rgba(0,0,0,0.6)">
                      <time
                        dateTime={new Date(+block.timestamp).toISOString()}
                        title={new Date(+block.timestamp).toISOString()}
                      >
                        {timeDistance(block.timestamp, language)}
                      </time>
                    </Box>
                  </Stack>
                </Stack>
              }
            />
          </ListItem>
        </Box>
      ))}
    </List>
  )
}

const TxList = ({ list }: { list: State['txList'] }) => {
  const [t, { language }] = useTranslation('tx')
  return (
    <List
      subheader={
        <ListSubheader component="div" sx={{ textTransform: 'capitalize', bgcolor: 'transparent' }}>
          {t(`latestTxs`)}
        </ListSubheader>
      }
    >
      {list.map((tx, idx) => (
        <Box key={tx.hash}>
          <Divider variant={idx ? 'middle' : 'fullWidth'} />
          <ListItem>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: '#cfd8dc' }}>Tx</Avatar>
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" minHeight={73}>
                  <Stack>
                    <Tooltip placement="top" title={tx.hash}>
                      <Box>
                        <NextLink href={`/tx/${tx.hash}`}>
                          <Button
                            color="secondary"
                            href={`/tx/${tx.hash}`}
                            component={Link}
                            className="mono-font"
                            sx={{
                              textTransform: 'lowercase',
                              whiteSpace: 'nowrap',
                            }}
                          >{`${tx.hash.slice(0, 8)}...${tx.hash.slice(-8)}`}</Button>
                        </NextLink>
                      </Box>
                    </Tooltip>
                    <Box alignItems="bottom" fontWeight={400} fontSize="0.875rem" pt={1} ml={1} color="rgba(0,0,0,0.6)">
                      <time dateTime={new Date(+tx.timestamp).toISOString()} title={t('timestamp')}>
                        {timeDistance(tx.timestamp, language)}
                      </time>
                    </Box>
                  </Stack>
                  <Stack sx={{ pl: { xs: 1, sm: 0 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }} noWrap>
                        {`${t('from')}:`}
                      </Typography>
                      <Tooltip placement="top" title={tx.from}>
                        <Box>
                          <NextLink href={`/account/${tx.from}`}>
                            <Button
                              color="secondary"
                              href={`/account/${tx.from}`}
                              component={Link}
                              className="mono-font"
                              sx={{ textTransform: 'lowercase' }}
                            >
                              {formatAddress(tx.from)}
                            </Button>
                          </NextLink>
                        </Box>
                      </Tooltip>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }} noWrap>
                        {`${t('to')}:`}
                      </Typography>
                      <Tooltip placement="top" title={tx.to}>
                        <Box>
                          <NextLink href={`/account/${tx.to}`}>
                            <Button
                              color="secondary"
                              href={`/account/${tx.to}`}
                              component={Link}
                              className="mono-font"
                              sx={{ textTransform: 'lowercase' }}
                            >
                              {formatAddress(tx.to)}
                            </Button>
                          </NextLink>
                        </Box>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  <Stack
                    direction={{ xs: 'row', sm: 'column' }}
                    justifyContent={{ xs: 'space-between', sm: tx.success ? 'start' : 'space-between' }}
                    alignItems="end"
                  >
                    <Chip
                      label={tx.type}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                    {tx.success ? null : <ErrorIcon color="warning" sx={{ mb: { sx: 0, sm: 1 } }} />}
                  </Stack>
                </Stack>
              }
            />
          </ListItem>
        </Box>
      ))}
    </List>
  )
}

const Home = (initState: State) => {
  const [home, setHome] = useState(initState)

  useWS(
    CHANNEL.HOME,
    (init: API.Home.Raw) => setHome(getHomeRes(init)),
    (update: API.Home.Raw) => {
      const { blockList, statistic, txList } = getHomeRes(update)
      const MAX_COUNT = 10
      setHome(state => ({
        statistic,
        blockList: [...blockList, ...state.blockList].sort((b1, b2) => b2.timestamp - b1.timestamp).slice(0, MAX_COUNT),
        txList: [...txList, ...state.txList].sort((t1, t2) => t2.timestamp - t1.timestamp).slice(0, MAX_COUNT),
      }))
    },
    [setHome],
  )

  return (
    <Container sx={{ py: 6 }}>
      <Statistic {...home.statistic} />
      <Stack direction={{ xs: 'column', sm: 'column', md: 'column', lg: 'row' }} spacing={2} sx={{ pt: 6 }}>
        <Paper sx={{ width: '100%', lg: { width: '50%', mr: 2 } }}>
          <BlockList list={home.blockList} />
        </Paper>
        <Paper sx={{ width: '100%', lg: { width: '50%', ml: 2 } }}>
          <TxList list={home.txList} />
        </Paper>
      </Stack>
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ res, locale }) => {
  try {
    const home = await fetchHome()
    const lng = await serverSideTranslations(locale, ['common', 'block', 'tx', 'statistic'])
    return { props: { ...home, ...lng } }
  } catch (err) {
    return handleApiError(err, res, locale)
  }
}

export default Home
