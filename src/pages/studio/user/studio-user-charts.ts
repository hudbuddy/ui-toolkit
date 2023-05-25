import { ChartData, ChartOptions, PluginOptionsByType } from 'chart.js'
import moment from 'moment'

export type UserBroadcastChartData = {
  totalBroadcasts: number
  successfulBroadcasts: number
  failedBroadcasts: number
  successPercentage: number
  successPercentageFormatted: string
  longestBroadcast: string
  timeBroadcastedHours: number
}

export const userBroadcastOverview = (
  labels: string[],
  data: UserBroadcastChartData[],
  currentMonth: string,
  currentYear: string,
) => {
  return {
    data: {
      currentMonth,
      currentYear,
      datasets: [
        {
          label: 'Broadcasts',
          backgroundColor: '#26ad80',
          barThickness: 'flex',
          data: data.map((x, i) => ({
            ...x,
            y: x.totalBroadcasts * x.successPercentage,
            x: labels[i],
          })),
        },
        {
          label: 'Failures',
          borderColor: '#e73C3e',
          borderWidth: 1,
          backgroundColor: '#ec6365',
          barThickness: 'flex',
          data: data.map((x, i) => ({
            ...x,
            y: Math.round(
              x.totalBroadcasts - x.totalBroadcasts * x.successPercentage,
            ),
            x: labels[i],
          })),
        },
      ],
    } as ChartData<'bar', UserBroadcastChartData[]>,
    options: {
      indexAxis: 'x',
      scales: {
        x: {
          stacked: true,
          ticks: {
            display: true,
            maxTicksLimit: 6,
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0,
            padding: 10,
            callback: (_, i) => {
              return moment(labels[i], 'YYYY-MM-DD').format('MMM YY')
            },
          },
        },
        y: {
          stacked: true
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          displayColors: false,
          titleMarginBottom: 8,
          padding: 12,
          callbacks: {
            title(context) {
              return `Week of ${moment(context[0].label).format('MMM D, YYYY')}`
            },
            label(context) {
              const data = context.raw as UserBroadcastChartData
              let totalBroadcasts = `• Successful: ${data.successfulBroadcasts}`
              let failedBroadcasts = `• Failed: ${data.failedBroadcasts}`
              let timeBroadcasted = `• Total: ${Math.floor(
                data.timeBroadcastedHours,
              )}h ${Math.floor((data.timeBroadcastedHours % 1) * 60)}m`
              let longestBroadcast = `• Longest: ${data.longestBroadcast}`

              return [
                totalBroadcasts,
                failedBroadcasts,
                longestBroadcast,
                timeBroadcasted,
              ]
            },
          },
        },
      } as PluginOptionsByType<'bar'>,
    } as ChartOptions<'bar'>,
  }
}
