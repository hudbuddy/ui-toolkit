import moment from 'moment'

export const date2str = (date: string, format: string): string => {
  const d = new Date(date)
  const z = {
    M: d.getMonth() + 1,
    d: d.getDate(),
    h: d.getHours(),
    m: d.getMinutes(),
    s: d.getSeconds(),
  } as any
  format = format.replace(/(M+|d+|h+|m+|s+)/g, function (v: string) {
    return ((v.length > 1 ? '0' : '') + z[v.slice(-1)]).slice(-2)
  })

  return format.replace(/(y+)/g, function (v) {
    return d.getFullYear().toString().slice(-v.length)
  })
}

// Accepts UTC timestamp
export const formatTimestamp = (timestamp: string) => {
  const utcTime = moment.utc(timestamp).format('MMM D YYYY h:mm A') + ' UTC'
  const localTime = moment.utc(timestamp).local().format('MMM D YYYY h:mm A')
  return { utcTime, localTime }
}
