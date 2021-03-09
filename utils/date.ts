import { format, formatDistanceToNow } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'

export const formatDatetime = (datetime: number) => {
  return format(new Date(datetime), 'yyyy/MM/dd hh:mm:ss')
}

export const timeDistance = (time: number, locale?: 'zh-CN' | 'en-US' | string) =>
  formatDistanceToNow(new Date(time), {
    addSuffix: true,
    includeSeconds: true,
    locale: locale === 'zh-CN' ? zhCN : enUS,
  })
