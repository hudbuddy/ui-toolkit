import { ChartData, ChartOptions } from 'chart.js'
import 'chart.js/auto'
import moment from 'moment'
import * as React from 'react'
import { Line } from 'react-chartjs-2'
import { Page } from '../../../Page'
import { BroadcastsTable } from '../../../components/BroadcastsTable'
import { Box, BrandBubble, Column, Label, Row, TextItem } from '../../../ui'
import { fetchAPI } from '../../../utils/fetch-api'
import * as Studio from '../studio-types'

// **********************
// * API RESPONSE TYPES *
// **********************

// type HistogramBin = {
//   timestamp_bin: Date
//   count: number
// }

type HistogramResponseItem = {
  timestamp_bin: string
  count: string
}

// *************
// * API CALLS *
// *************

async function getBroadcasts(): Promise<Studio.Broadcast[]> {
  return fetchAPI(`/api/broadcasts`, { timeout: 20000 }, [])
}

type BroadcastsContext = {
  broadcasts: Studio.Broadcast[]
  fetchBroadcasts: () => Promise<void>
}

const BroadcastsContext = React.createContext<BroadcastsContext>(null)

async function getHistogram(): Promise<HistogramResponseItem[]> {
  const response = await fetch(`/api/broadcasts/quarter-hour`, {
    method: 'POST',
    body: JSON.stringify({
      startDate: null,
      endDate: null,
    }),
  })
  const body: HistogramResponseItem[] = await response.json()
  return body
}

// ***********************
// * Utilitiy Components *
// ***********************

const Panel = (props: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        display: 'flex',
        padding: 20,
        flexDirection: 'column',
        alignItems: 'stretch',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        height: '100%',
        width: '100%',
      }}
    >
      {props.children}
    </div>
  )
}

// *******************
// * Broadcasts List *
// *******************

const broadcastReducer: React.Reducer<
  Studio.Broadcast[],
  Studio.Broadcast[]
> = (p, a) => a || p

export const BroadcastsProvider = (props: { children: React.ReactNode }) => {
  const [broadcasts, setBroadcasts] = React.useReducer(broadcastReducer, [])

  const fetchBroadcasts = React.useCallback(() => {
    return getBroadcasts().then(setBroadcasts)
  }, [])

  React.useEffect(() => {
    fetchBroadcasts()
  }, [])

  return (
    <BroadcastsContext.Provider value={{ broadcasts, fetchBroadcasts }}>
      {props.children}
    </BroadcastsContext.Provider>
  )
}

export const useBroadcasts = () => React.useContext(BroadcastsContext)

const BroadcastsPanel = () => {
  const { broadcasts } = React.useContext(BroadcastsContext)
  return <BroadcastsTable broadcasts={broadcasts} />
}

// **************
// * Line Chart *
// **************

const LineChart = (props: { data: HistogramResponseItem[] }) => {
  const labels = React.useMemo(
    () => props.data.map((d) => d.timestamp_bin),
    [props.data],
  )
  const data = React.useMemo(() => props.data.map((d) => d.count), [props.data])
  const historicalBroadcasts = React.useMemo(() => {
    return {
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Average',
            pointBackgroundColor: '#26ad80',
            pointBorderColor: 'white',
            backgroundColor: '#26ad8033',
            borderColor: '#26ad80',
            fill: true,
            data: data.map((d) => Number(d)),
          },
        ],
      } as ChartData<'line', number[], string>,
      options: {
        elements: {
          point: {
            radius: 0,
            hitRadius: 5,
            hoverRadius: 5,
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
                return moment(context[0].label).format('llll')
              },
            },
          },
        },
        scales: {
          y: {
            min: 0,
            ticks: {
              stepSize: 1,
            },
          },
          x: {
            type: 'timeseries',
            time: {
              unit: 'hour',
            },
            ticks: {
              maxTicksLimit: 4,
              display: true,
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        pointLabels: {
          display: false,
        },
      } as ChartOptions<'line'>,
    }
  }, [labels, data])

  return (
    <Line
      data={historicalBroadcasts.data}
      options={historicalBroadcasts.options}
    />
  )
}

const histogramReducer: React.Reducer<
  HistogramResponseItem[],
  HistogramResponseItem[]
> = (prevState, action) => action || prevState

const HistogramPanel = () => {
  const [data, setData] = React.useReducer(histogramReducer, [])
  React.useEffect(() => {
    getHistogram().then(setData)
  }, [])
  return (
    <Panel>
      <Column height="100%" width="100%" gap={10}>
        <TextItem
          text="Broadcasts Past 24 Hours"
          textTransform="uppercase"
          opacity={0.7}
          fontSize={13}
        />
        <Box height={270} width="100%" position="relative" overflow="hidden">
          <LineChart data={data} />
        </Box>
      </Column>
    </Panel>
  )
}

const DestinationCount = (props: { type: Studio.Platform }) => {
  const { broadcasts } = React.useContext(BroadcastsContext)
  const total = React.useMemo(
    () => broadcasts.filter((d) => d.platform === props.type).length,
    [props.type, broadcasts],
  )
  return (
    <Column gap={8} style={{ alignItems: 'center' }}>
      <BrandBubble name={props.type} />
      <TextItem text={total} />
    </Column>
  )
}

const CurrentBroadcastsPanel = () => {
  const { broadcasts } = React.useContext(BroadcastsContext)
  const over6Hours = React.useMemo(() => {
    return broadcasts.filter((b) => {
      const startDate = Number(new Date(b.rawStartDate))
      const now = Date.now()
      return now - startDate > 1000 * 60 * 60 * 6
    }).length
  }, [broadcasts])

  return (
    <Panel>
      <TextItem
        text="Current Broadcasts"
        textTransform="uppercase"
        opacity={0.7}
        fontSize={13}
      />
      <Column justifyContent="space-between" flexGrow={1}>
        <Row style={{ marginTop: 10 }} gap={20}>
          <TextItem text={broadcasts.length} fontSize={64} />
          <Column justifyContent="space-between">
            <TextItem text={over6Hours} fontSize={24} color="warning" />
            <TextItem
              text="Over 6 hours"
              maxWidth={70}
              muted={true}
              lineHeight={1}
            />
          </Column>
        </Row>
        <Column style={{ marginTop: 10 }}>
          <Label text="Destination Breakdown" />
          <Row style={{ marginTop: 10 }} gap={8}>
            <DestinationCount type={Studio.Platform.Twitch} />
            <DestinationCount type={Studio.Platform.Facebook} />
            <DestinationCount type={Studio.Platform.YouTube} />
            <DestinationCount type={Studio.Platform.CustomRTMP} />
          </Row>
        </Column>
      </Column>
    </Panel>
  )
}

export const BroadcastsPage = () => {
  return (
    <BroadcastsProvider>
      <Page title="Active Broadcasts" showTitle={true}>
        <Row
          height={250}
          gap={20}
          style={{
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            marginBottom: 20,
          }}
        >
          <Box flex="0 0 220px">
            <CurrentBroadcastsPanel />
          </Box>
          <Box flexGrow={1} overflow="hidden">
            <HistogramPanel />
          </Box>
        </Row>
        <BroadcastsPanel />
      </Page>
    </BroadcastsProvider>
  )
}
