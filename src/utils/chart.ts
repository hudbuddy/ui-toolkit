import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const bar = {
  options: {
    elements: {},
    plugins: {
      legend: {
        display: false,
      },
    },
    animation: {},
    layout: {
      padding: { left: 0, right: 0, top: 0, bottom: 0 },
    },
    skipNull: true,
    maintainAspectRatio: false
  } as ChartOptions<'bar'>,
}
