import { useState } from 'react'
import { useTranslation } from 'next-i18next'
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
  Legend,
} from 'recharts'
import { Container, Stack, Paper, Box, Typography, Alert } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { CustomYLabel as YLabel, CustomTooltip } from 'components/ChartComponents'
import ClearIcon from 'assets/icons/clear.svg'
import { GAS_UNIT, theme, getDailyDataRes } from 'utils'

const bgColors = ['#fff', '#fff']
const accentColors = [theme.palette.primary.main, '#28B959']

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
const ChartList: React.FC<{ charts: { dailyData: ReturnType<typeof getDailyDataRes> } }> = ({ charts }) => {
  const [t] = useTranslation('charts')
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [alertOpen, setAlertOpen] = useState(true)

  const renderTraveller = props => {
    const { x, y, width, height } = props
    if (isMobile) {
      return (
        <svg x={x - 5.5} y={y + 10} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect
            x="0.25"
            y="0.25"
            width="11.5"
            height="15.5"
            rx="1.75"
            fill="#F0F0F0"
            stroke="#999999"
            strokeWidth="0.5"
          />
          <line x1="3.5" y1="4.5" x2="3.5" y2="11.5" stroke="#999999" strokeLinecap="round" />
          <line x1="8.5" y1="4.5" x2="8.5" y2="11.5" stroke="#999999" strokeLinecap="round" />
        </svg>
      )
    }
    return (
      <svg x={x - 7} y={isMobile ? y + 6 : y + 12} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="14" height="23" rx="1.5" fill="#F0F0F0" stroke="#999999" />
        <line x1="5.5" y1="6.5" x2="5.5" y2="17.5" stroke="#999999" strokeLinecap="round" />
        <line x1="9.5" y1="6.5" x2="9.5" y2="17.5" stroke="#999999" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <Container sx={{ pt: 2, pb: { xs: 5.5, md: 11 }, px: { xs: 2, lg: 0 } }}>
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
        action={<ClearIcon data-cy="remove-charts-banner-btn" onClick={() => setAlertOpen(false)} />}
      >
        {t(`updateTimeInfo`)}
      </Alert>
      <Stack spacing={{ xs: 3, md: 5 }} data-cy="charts-list">
        {keysList.map(keys => (
          <Box key={keys.map(k => k.key).join()}>
            <Typography
              align="left"
              fontWeight={500}
              color="secondary"
              fontSize={{ xs: 15, md: 20 }}
              mb={{ xs: 1.8, md: 3 }}
              data-cy="chart-title"
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
                      ? keys.length >= 2
                        ? { top: 32, right: -14, left: -14, bottom: 48 }
                        : { top: 32, right: 24, left: 8, bottom: 48 }
                      : { top: 48, right: 108, left: 100, bottom: 76 }
                  }
                >
                  <CartesianGrid strokeDasharray={isMobile ? '2' : '4'} />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: isMobile ? 11 : 12,
                      color: theme.palette.secondary.main,
                    }}
                    dy={isMobile ? 20 : 16}
                    tickLine={false}
                    minTickGap={20}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  {keys.map(({ key, unit }, idx) => (
                    <YAxis
                      label={{
                        content: ((keys.length < 2 && isMobile) || !isMobile) && (
                          <YLabel
                            theme={theme}
                            isMobile={isMobile}
                            value={t(key)}
                            align={idx === 0 ? 'left' : 'right'}
                          />
                        ),
                      }}
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
                  {isMobile && keys.length > 1 && (
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      iconSize={6}
                      wrapperStyle={{ fontSize: 12 }}
                      formatter={(value, entry, index) => (
                        <span style={{ color: theme.palette.secondary.light }}>{value}</span>
                      )}
                    />
                  )}
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
  )
}

export default ChartList
