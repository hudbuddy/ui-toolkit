import { ChartData, ChartOptions } from 'chart.js'

export const npsGroupsBreakdown = (labels, data) => {
  return {
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Count',
          backgroundColor: '#26ad80',
          data,
        },
      ],
    } as ChartData<'bar'>,
    options: {
      indexAxis: 'y',
    } as ChartOptions<'bar'>,
  }
}

export const ratingGroupsBreakdown = (labels, data) => {
  return {
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Count',
          backgroundColor: '#26ad80',
          data,
        },
      ],
    } as ChartData<'bar'>,
    options: {
      indexAxis: 'x',
    } as ChartOptions<'bar'>,
  }
}
