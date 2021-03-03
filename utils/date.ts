import { format, formatDistance } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'

export const formatDatetime = (datetime: number) => {
  return format(new Date(datetime), 'yyyy/MM/dd hh:mm:ss')
}

export const timeDistance = (time: string, locale?: 'zh-CN' | 'en-US' | string) =>
  formatDistance(new Date(+time), new Date(), { addSuffix: true, locale: locale === 'zh-CN' ? zhCN : enUS })
