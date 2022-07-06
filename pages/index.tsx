import type { API } from 'utils/api/utils'
import type { Cache } from 'pages/api/cache'
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
  Box,
  Stack,
  Button,
  Divider,
  Paper,
  Typography,
  Badge,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { timeDistance, handleApiError, useWS, getHomeRes, formatInt, CHANNEL, IS_MAINNET } from 'utils'
import Search from 'components/Search'
import Tooltip from 'components/Tooltip'

type State = API.Home.Parsed

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

const Statistic = ({ blockCount, txCount, tps, accountCount, averageBlockTime }: State['statistic']) => {
  const [t] = useTranslation('statistic')
  const stats = {
    blockHeight: +blockCount ? (+blockCount - 1).toLocaleString('en') : '-',
    txCount: (+txCount).toLocaleString('en'),
    tps: (+tps).toLocaleString('en'),
    accountCount: (+accountCount).toLocaleString('en'),
    averageBlockTime,
  }

  return (
    <Grid
      container
      rowSpacing={{ xs: 2, md: 3 }}
      columnSpacing={{ xs: 1, md: 6 }}
      sx={{ maxWidth: { xs: '35%', md: '50%' }, pb: 2 }}
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
            <Typography variant="body1" noWrap fontSize={{ xs: 18, md: 32 }} color="primary" sx={{ fontWeight: 500 }}>
              {`${stats[field.key]}`}
              <Typography component="span" fontSize={{ xs: 12, md: 16 }} fontWeight={500}>{`${
                field.suffix || ''
              }`}</Typography>
            </Typography>
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
        sx={{ p: 0, mt: 1, borderRadius: { xs: '8px', md: '16px' }, boxShadow: 'none', border: '1px solid #f0f0f0' }}
      >
        {children}
      </List>
    </Box>
  )
}

const BlockList = ({ list }: { list: State['blockList'] }) => {
  const [t, { language }] = useTranslation(['block', 'common'])
  return (
    <ListContainer title={t(`latestBlocks`)} link="/blocks" tooltip={t(`view_all_blocks`, { ns: 'common' })}>
      {list?.map((block, idx) => (
        <Stack key={block.hash} sx={{ '& :hover': { backgroundColor: 'primary.light' } }}>
          {idx !== 0 && <Divider variant="middle" color="#f0f0f0" sx={{ borderColor: 'transparent' }} />}
          <ListItem>
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
            <ListItemText
              primary={
                <Stack direction="row" alignItems="center" sx={{ height: { xs: 52, md: 88 } }}>
                  <Stack flexGrow={1} px={{ xs: 1, md: 2 }} justifyContent="space-between" height={{ xs: 36, md: 56 }}>
                    <Box>
                      <NextLink href={`/block/${block.hash}`} passHref>
                        <Button
                          color="primary"
                          href={`/block/${block.hash}`}
                          component={Link}
                          sx={{ 'fontSize': 14, 'p': 0, 'lineHeight': 1.5, '&:hover': { backgroundColor: 'unset' } }}
                          disableRipple
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
                        dateTime={new Date(+block.timestamp).toISOString()}
                        title={new Date(+block.timestamp).toISOString()}
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
                    {formatInt(block.txCount)} Txs
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

const TxList = ({ list }: { list: State['txList'] }) => {
  const [t, { language }] = useTranslation('tx')
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.up('md'))
  return (
    <ListContainer title={t(`latestTxs`)} link="/txs" tooltip={t(`view_all_transactions`, { ns: 'common' })}>
      {list?.map((tx, idx) => (
        <Box key={tx.hash} sx={{ '& :hover': { backgroundColor: 'primary.light' } }}>
          {idx !== 0 && <Divider variant="middle" color="#f0f0f0" sx={{ borderColor: 'transparent' }} />}
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Badge
                color="warning"
                variant="dot"
                invisible={tx.polyjuice_status !== 'failed'}
                overlap="circular"
                badgeContent=""
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
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
              </Badge>
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" alignItems="center" sx={{ height: { xs: 52, md: 88 } }}>
                  <Stack flexGrow={1} px={{ xs: 1, md: 2 }} justifyContent="space-between" height={{ xs: 36, md: 56 }}>
                    <Tooltip title={tx.hash} className="mono-font">
                      <Box sx={{ width: 'min-content' }}>
                        <NextLink href={`/tx/${tx.hash}`} passHref>
                          <Button
                            color="primary"
                            href={`/tx/${tx.hash}`}
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
                            {formatAddress(tx.hash, matches)}
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
                      <time dateTime={new Date(+tx.timestamp).toISOString()} title={t('timestamp')}>
                        {timeDistance(tx.timestamp, language)}
                      </time>
                    </Box>
                  </Stack>
                  <Stack height={{ xs: 36, md: 56 }} sx={{ pl: { xs: 1, sm: 0 } }} justifyContent="space-between">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        fontSize={{ xs: 12, md: 14 }}
                        sx={{ textTransform: 'capitalize' }}
                        color="secondary"
                        noWrap
                      >
                        {`${t('from')}:`}
                      </Typography>
                      <Tooltip title={tx.from} className="mono-font">
                        <Box>
                          <NextLink href={`/account/${tx.from}`} passHref>
                            <Button
                              color="primary"
                              href={`/account/${tx.from}`}
                              component={Link}
                              className="mono-font"
                              disableRipple
                              fontSize={{ xs: 13, md: 14 }}
                              sx={{
                                'textTransform': 'lowercase',
                                'py': 0,
                                'px': 1,
                                '&:hover': { backgroundColor: 'unset' },
                              }}
                            >
                              {formatAddress(tx.from, matches)}
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
                      <Tooltip title={tx.to} className="mono-font">
                        <Box>
                          <NextLink href={`/account/${tx.to}`} passHref>
                            <Button
                              color="primary"
                              href={`/account/${tx.to}`}
                              component={Link}
                              className="mono-font"
                              disableRipple
                              fontSize={{ xs: 13, md: 14 }}
                              sx={{
                                'textTransform': 'lowercase',
                                'py': 0,
                                'px': 1,
                                '&:hover': { backgroundColor: 'unset' },
                              }}
                            >
                              {formatAddress(tx.to, matches)}
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
      ))}
    </ListContainer>
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
    <Box sx={{ pb: { xs: 8, md: 11 } }}>
      <Box sx={{ bgcolor: 'primary.light' }}>
        <Container sx={{ px: { md: 3, lg: 1 } }}>
          <Search />
          <Stack direction="row" sx={{ pt: 2.5, pb: 1 }} justifyContent="space-between" alignItems="center">
            <Statistic {...home.statistic} />
            <video autoPlay loop style={{ maxWidth: '78%', minWidth: '45%', height: 'auto', maxHeight: 444 }}>
              <source src={IS_MAINNET ? '/home-video.mp4' : '/testnet-home-video.mp4'} />
            </video>
          </Stack>
        </Container>
      </Box>
      <Container sx={{ px: { md: 2, lg: 1 } }}>
        <Stack direction={{ xs: 'column', sm: 'column', md: 'column', lg: 'row' }} spacing={4} sx={{ pt: 6 }}>
          <Box sx={{ width: '100%', lg: { width: '50%', mr: 2 } }}>
            <BlockList list={home.blockList} />
          </Box>
          <Box sx={{ width: '100%', lg: { width: '50%', ml: 2 } }}>
            <TxList list={home.txList} />
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ req, res, locale }) => {
  try {
    const home = await fetch(`http://${req.headers.host}/api/cache`)
      .then(res => res.json())
      .then((res: Cache) => res.home)
    const lng = await serverSideTranslations(locale, ['common', 'block', 'tx', 'statistic'])
    return { props: { ...home, ...lng } }
  } catch (err) {
    return handleApiError(err, res, locale)
  }
}

export default Home
