import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { GetServerSideProps } from 'next'
import dayjs from 'dayjs'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import SubpageHead from 'components/SubpageHead'
import { fetchDailyData, getDailyDataRes, handleApiError } from 'utils'
const ChartList = dynamic(() => import('components/ChartList'), { ssr: false })

type State = { dailyData: ReturnType<typeof getDailyDataRes> }

const Charts = (initState: State) => {
  const [t] = useTranslation('charts')
  const [charts, setCharts] = useState(initState)

  useEffect(() => {
    setCharts(initState)
  }, [setCharts, initState])

  const title = `${t('charts')}`

  return (
    <>
      <SubpageHead subtitle={title} />
      <ChartList charts={charts} />
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
