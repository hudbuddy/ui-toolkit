import { ChartData, ChartOptions } from 'chart.js'
import 'chart.js/auto'
import * as React from 'react'
import { Line } from 'react-chartjs-2'
import { Page } from '../../../Page'
import { Broadcast, BroadcastsTable } from '../../../components/BroadcastsTable'
import {
  Box,
  Column,
  Heading1,
  Heading2,
  Heading3,
  Label,
  PlatformBubble,
  Row,
  TextItem
} from '../../../ui'
import { Platform } from '../studio-types'

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

async function getBroadcasts(): Promise<Broadcast[]> {
  const response = await fetch(`/api/broadcasts`)
  const body: Broadcast[] = (await response.json()) ?? []
  return body
}

type BroadcastsContext = {
  broadcasts: Broadcast[]
  setBroadcasts: (broadcasts: Broadcast[]) => void
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

const broadcastReducer: React.Reducer<Broadcast[], Broadcast[]> = (p, a) =>
  a || p

const BroadcastsProvider = (props: { children: React.ReactNode }) => {
  const [broadcasts, setBroadcasts] = React.useReducer(broadcastReducer, [])
  return (
    <BroadcastsContext.Provider value={{ broadcasts, setBroadcasts }}>
      {props.children}
    </BroadcastsContext.Provider>
  )
}

const BroadcastsPanel = () => {
  const [limit, setLimit] = React.useState(25)
  const { broadcasts, setBroadcasts } = React.useContext(BroadcastsContext)
  const [page, setPage] = React.useState(0)

  React.useEffect(() => {
    getBroadcasts().then(setBroadcasts)
  }, [page, limit])

  const tableData = React.useMemo(
    () => broadcasts.slice(page * limit, (page + 1) * limit),
    [page, limit, broadcasts],
  )

  return (
    <BroadcastsTable
      page={page}
      limit={limit}
      data={tableData}
      total={broadcasts.length}
      onChange={({ page, limit }) => {
        setPage(page)
        setLimit(limit)
      }}
    />
  )
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
            backgroundColor: '#26ad80',
            borderColor: '#26ad80',
            data: data.map((d) => Number(d)),
          },
        ],
      } as ChartData<'line', number[], string>,
      options: {
        legend: {
          display: false,
        },
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
    <div style={{ flexGrow: 2, marginLeft: 10 }}>
      <Panel>
        <Heading3 text="Broadcasts Past 24 Hours" />
        <Box height={350} width="100%">
          <LineChart data={data} />
        </Box>
      </Panel>
    </div>
  )
}

const DestinationCount = (props: { type: string }) => {
  const { broadcasts } = React.useContext(BroadcastsContext)
  const total = React.useMemo(
    () => broadcasts.filter((d) => d.platform === props.type).length,
    [props.type, broadcasts],
  )
  return (
    <Column gap={8} style={{ alignItems: 'center' }}>
      <PlatformBubble type={props.type} />
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
      <Heading3 text="Current Broadcasts" />
      <Row style={{ marginTop: 10 }}>
        <Heading1 text={broadcasts.length} />
        <Column>
          <Heading2 text={over6Hours} />
          <Label text="Over 6 hours" />
        </Column>
      </Row>
      <Column style={{ marginTop: 10 }}>
        <Label text="Destination Breakdown" />
        <Row style={{ marginTop: 10 }} gap={8}>
          <DestinationCount type={Platform.Twitch} />
          <DestinationCount type={Platform.Facebook} />
          <DestinationCount type={Platform.YouTube} />
          <DestinationCount type={Platform.CustomRTMP} />
        </Row>
      </Column>
    </Panel>
  )
}

export const BroadcastsPage = () => {
  return (
    <BroadcastsProvider>
      <Page title="Active Broadcasts" showTitle={true}>
        <Row
          style={{
            flexWrap: 'nowrap',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            marginBottom: 10,
          }}
        >
          <CurrentBroadcastsPanel />
          <HistogramPanel />
        </Row>
        <BroadcastsPanel />
      </Page>
    </BroadcastsProvider>
  )
}
