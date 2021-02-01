import { format } from 'date-fns'

export const formatDatetime = (datetime: number) => {
  return format(new Date(datetime), 'yyyy-MM-dd hh:mm:ss')
}
