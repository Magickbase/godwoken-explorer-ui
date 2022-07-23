import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import dayjs from 'dayjs'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  LineChart,
  Line,
} from 'recharts'
import { Container, Stack, Paper, Box, Typography, Alert } from '@mui/material'
import SubpageHead from 'components/SubpageHead'
import { CustomYLabel as YLabel, CustomTooltip } from 'components/ChartComponents'
import ClearIcon from '../assets/icons/clear.svg'
import { fetchDailyData, getDailyDataRes, handleApiError, GAS_UNIT, theme } from 'utils'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

const bgColors = ['#fff', '#fff']
const accentColors = [theme.palette.primary.main, '#28B959']

type State = { dailyData: ReturnType<typeof getDailyDataRes> }
const keysList = [
  [{ key: 'avgBlockSize', unit: 'k' }],
  [{ key: 'avgBlockTime', unit: 's' }],
  [{ key: 'blockCount' }],
  [{ key: 'txCount', unit: 'k' }],
  [
    { key: 'avgGasUsed', unit: GAS_UNIT },
    { key: 'avgGasLimit', unit: GAS_UNIT },
  ],
  [{ key: 'erc20Transfers', unit: 'k' }],
]

const Charts = (initState: State) => {
  const [t] = useTranslation('charts')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [charts, setCharts] = useState(initState)
  const [alertOpen, setAlertOpen] = useState(true)

  useEffect(() => {
    setCharts(initState)
  }, [setCharts, initState])

  const title = `${t('charts')}`

  const renderTraveller = props => {
    const { x, y, width, height } = props
    return (
      <svg x={x - 7} y={isMobile ? y + 6 : y + 12} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="14" height="23" rx="1.5" fill="#F0F0F0" stroke="#999999" />
        <line x1="5.5" y1="6.5" x2="5.5" y2="17.5" stroke="#999999" strokeLinecap="round" />
        <line x1="9.5" y1="6.5" x2="9.5" y2="17.5" stroke="#999999" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <>
      <SubpageHead subtitle={title} />
      <Container sx={{ pt: 2, pb: { xs: 5.5, md: 11 }, px: { xs: 2, sm: 3, md: 2, lg: 0 } }}>
        <Alert
          severity="info"
          sx={{
            'display': alertOpen ? 'flex' : 'none',
            'borderRadius': { xs: 2, md: 4 },
            'fontSize': { xs: 12, md: 14 },
            'mb': { xs: 2.5, md: 3.75 },
            'px': { xs: 1.5, md: 2 },
            'height': { xs: 36, md: 40 },
            'bgcolor': '#FFF5E5',
            'color': '#FF9900',
            'alignItems': 'center',
            '& .MuiAlert-icon': {
              color: '#FF9900',
              mr: { xs: 1.5, md: 2 },
            },
            '& .MuiSvgIcon-root': {
              width: { xs: 14, md: 20 },
              height: { xs: 14, md: 20 },
            },
            '& .MuiAlert-action ': {
              alignItems: 'center',
              cursor: 'pointer',
              p: 0,
              mr: 0,
              svg: {
                width: { xs: 14, md: 19 },
                height: { xs: 14, md: 19 },
              },
            },
          }}
          action={<ClearIcon onClick={() => setAlertOpen(false)} />}
        >
          {t(`updateTimeInfo`)}
        </Alert>
        <Stack spacing={{ xs: 3, md: 5 }}>
          {keysList.map(keys => (
            <Box key={keys.map(k => k.key).join()}>
              <Typography
                align="left"
                fontWeight={500}
                color="secondary"
                fontSize={{ xs: 15, md: 20 }}
                mb={{ xs: 1.8, md: 3 }}
              >
                {t(`title.${keys.map(k => k.key).join('/')}`)}
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  height: { xs: 376, sm: 456 },
                  bgcolor: bgColors[0],
                  borderRadius: { xs: 2, md: 4 },
                  border: 'solid #f0f0f0',
                  borderWidth: { xs: 0.5, md: 1 },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    height={300}
                    data={charts.dailyData}
                    margin={
                      isMobile
                        ? { top: 32, right: 24, left: 8, bottom: 30 }
                        : { top: 48, right: 108, left: 100, bottom: 64 }
                    }
                  >
                    <CartesianGrid strokeDasharray={isMobile ? '2' : '4'} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: isMobile ? 11 : 12, color: theme.palette.secondary.main }}
                      tickLine={false}
                      minTickGap={30}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    {keys.map(({ key, unit }, idx) => (
                      <YAxis
                        label={{
                          content:
                            idx === 0 ? (
                              <YLabel theme={theme} isMobile={isMobile} value={t(key)} />
                            ) : (
                              <YLabel theme={theme} isMobile={isMobile} value={t(key)} align="right" />
                            ),
                        }}
                        hide={idx === 1 && isMobile}
                        unit={unit === GAS_UNIT && isMobile ? '' : unit}
                        key={key + '-yaxis'}
                        yAxisId={idx}
                        orientation={idx ? 'right' : 'left'}
                        tick={{ fontSize: isMobile ? 11 : 12, color: theme.palette.secondary.main }}
                        tickLine={false}
                        minTickGap={15}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                    ))}
                    {keys.map(({ key }, idx) => (
                      <Tooltip
                        key={key}
                        wrapperStyle={{ fontSize: isMobile ? 13 : 14 }}
                        content={<CustomTooltip theme={theme} isMobile={isMobile} />}
                        offset={18}
                      />
                    ))}
                    <Brush
                      height={isMobile ? 36 : 48}
                      tickFormatter={() => ''}
                      stroke="#ccc"
                      y={isMobile ? 318 : 358}
                      traveller={renderTraveller}
                      travellerWidth={1}
                    >
                      <AreaChart height={isMobile ? 36 : 48} data={charts.dailyData}>
                        {keys.map(({ key }, idx) => (
                          <Area
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={accentColors[idx]}
                            fill="#cccccc"
                            fillOpacity={0.2}
                          />
                        ))}
                      </AreaChart>
                    </Brush>
                    {keys.map(({ key }, idx) => (
                      <Line
                        yAxisId={idx}
                        dot={false}
                        name={t(key)}
                        key={key}
                        type="monotone"
                        dataKey={key}
                        legendType="circle"
                        stroke={accentColors[idx]}
                        strokeWidth={2}
                        activeDot={{
                          stroke: '#fff',
                          strokeWidth: isMobile ? 4.5 : 8,
                          r: isMobile ? 6 : 10,
                          opacity: 0.9,
                        }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Box>
          ))}
        </Stack>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ locale, res }) => {
  try {
    const today = dayjs().format('YYYY-MM-DD')
    const startDay = '2021-11-30'

    const [dailyData, lng] = await Promise.all([
      fetchDailyData({ start_date: startDay, end_date: today }),
      serverSideTranslations(locale, ['common', 'charts']),
    ])

    return { props: { ...lng, dailyData: dailyData.reverse() } }
  } catch (err) {
    return handleApiError(err, res, locale)
  }
}

export default Charts
