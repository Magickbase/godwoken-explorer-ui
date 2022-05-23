import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import dayjs from 'dayjs'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts'
import { Container, Stack, Paper, Box, colors, Typography, Alert } from '@mui/material'
import SubpageHead from 'components/SubpageHead'
// import PageTitle from 'components/PageTitle'
import { fetchDailyData, getDailyDataRes, handleApiError, theme, GAS_UNIT } from 'utils'

const bgColors = ['#fff', '#fff']
const accentColors = [colors.lightBlue['A700'], colors.cyan['A700']]

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
  const [charts, setCharts] = useState(initState)
  const [t] = useTranslation('charts')

  useEffect(() => {
    setCharts(initState)
  }, [setCharts, initState])

  const title = `${t('charts')}`
  return (
    <>
      <SubpageHead subtitle={title} />
      <Container sx={{ py: 6 }}>
        <Alert severity="info" sx={{ marginBottom: 4 }}>
          {t(`updateTimeInfo`)}
        </Alert>
        {/* <PageTitle>{title}</PageTitle> */}
        <Stack spacing={2}>
          {keysList.map(keys => (
            <Paper key={keys.map(k => k.key).join()} elevation={0}>
              <Box sx={{ height: '300px', bgcolor: bgColors[0] }} p={4}>
                <Typography variant="h5" align="center">
                  {t(`title.${keys.map(k => k.key).join('/')}`)}
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    width={500}
                    height={300}
                    data={charts.dailyData}
                    margin={{ top: 50, right: 30, left: 30, bottom: 0 }}
                  >
                    <defs>
                      {keys.map(({ key }, idx) => (
                        <linearGradient key={key} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={accentColors[idx]} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={accentColors[idx]} stopOpacity={0.1} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    {keys.map(({ key, unit }, idx) => (
                      <YAxis
                        label={{
                          value: t(key),
                          position: idx ? 'insideTopRight' : 'insideTopLeft',
                          offset: '-30',
                        }}
                        unit={unit}
                        key={key}
                        yAxisId={idx}
                        orientation={idx ? 'right' : 'left'}
                        tick={{ fontSize: 12 }}
                      />
                    ))}
                    <Tooltip />
                    <Legend />
                    <Brush height={20} tickFormatter={() => ''} stroke={theme.palette.primary.light}>
                      <AreaChart height={30} data={charts.dailyData}>
                        <defs>
                          {keys.map(({ key }, idx) => (
                            <linearGradient key={key} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={accentColors[idx]} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={accentColors[idx]} stopOpacity={0.1} />
                            </linearGradient>
                          ))}
                        </defs>
                        {keys.map(({ key }, idx) => (
                          <Area
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={accentColors[idx]}
                            fill={`url(#color-${key})`}
                            fillOpacity={1}
                          />
                        ))}
                      </AreaChart>
                    </Brush>
                    {keys.map(({ key }, idx) => (
                      <Area
                        yAxisId={idx}
                        name={t(key)}
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={accentColors[idx]}
                        fill={`url(#color-${key})`}
                        fillOpacity={1}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          ))}
        </Stack>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<State> = async ({ locale, res }) => {
  try {
    const today = dayjs().format('YYYY-MM-DD')
    // const startDay = '2021-11-31'
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
