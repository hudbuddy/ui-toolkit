import { useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { classes, style } from 'typestyle'
import { Page } from '../../Page'
import { Color, CustomSelect, Label, TextItem } from '../../ui'
import { Box, Column, Row } from '../../ui/Layout'
import { Icon } from '../../ui/icons/Icon'
import { bar } from '../../utils/chart'
import { npsGroupsBreakdown, ratingGroupsBreakdown } from './criterion-charts'
import {
  CriterionProvider,
  DATE_RANGES,
  DateRange,
  useCriterion,
} from './criterion-context'
import { CriterionReviews } from './criterion-reviews'

export const CriterionPage = () => {
  return (
    <CriterionProvider>
      <Page title="Criterion">
        <Body />
      </Page>
    </CriterionProvider>
  )
}

const Body = () => {
  const ctx = useCriterion()

  if (!ctx.data) {
    // Loading...
    return null
  }

  return (
    <Column width="100%" height="100%" maxWidth={1200} paddingRight={20}>
      {/* Range Selector */}
      <Row width="100%" alignItems="flex-end" justifyContent="space-between">
        <Box marginRight={20} fontSize={13} opacity={0.4}>
          {ctx.rangeData.tagline}
        </Box>
        <Box width={200}>
          <CustomSelect
            height={40}
            value={String(ctx.dateRange)}
            onChange={(x) => ctx.setDateRange(Number(x))}
            options={Object.entries(DATE_RANGES).map(([value, x]) => ({
              value,
              label: x.displayName,
            }))}
          />
        </Box>
      </Row>
      {/* Overview */}
      <Section style={{ gap: 40, flexWrap: 'wrap' }}>
        <StatsBlock
          label="Net Promoter Score"
          fontSize={50}
          currentValue={ctx.data.currentStats.nps_score}
          previousValue={ctx.data.previousStats.nps_score}
        />
        <StatsBlock
          label="Responses"
          currentValue={ctx.data.currentStats.review_count}
          previousValue={ctx.data.previousStats.review_count}
        />
        <StatsBlock
          label="Response Rate"
          currentValue={ctx.data.currentStats.response_rate}
          previousValue={ctx.data.previousStats.response_rate}
          type="percentage"
        />
        <StatsBlock
          label="NPS Mean Score"
          currentValue={ctx.data.currentStats.nps_mean_score}
          previousValue={ctx.data.previousStats.nps_mean_score}
        />
      </Section>
      {/* Groups Breakdown */}
      <Section>
        <Column width="100%">
          <Label style={{ marginBottom: 20 }} text="NPS Groups Breakdown" />
          <GroupsBreakdown />
        </Column>
      </Section>
      <Section>
        <Column width="100%">
          <Label style={{ marginBottom: 20 }} text="Ratings Breakdown" />
          <RatingsBreakdown />
        </Column>
      </Section>
      {/* Details */}
      <Details />
    </Column>
  )
}

enum DetailView {
  Reviews,
  Responses,
  Triggers,
}

const DetailViews = {
  [DetailView.Reviews]: CriterionReviews,
  [DetailView.Responses]: () => <div>1</div>,
  [DetailView.Triggers]: () => <div>2</div>,
}

const tabStyle = style({
  cursor: 'pointer',
  padding: '10px 30px',
  borderRadius: '15px',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,10%)',
    },
    '&.active': {
      backgroundColor: 'rgba(255,255,255,5%)',
    },
  },
})

const DetailTab = (props: {
  label: string
  count: number
  activeView: DetailView
  view: DetailView
  onClick: () => void
}) => (
  <Column
    className={classes(props.view === props.activeView && 'active', tabStyle)}
    alignItems="center"
    onClick={props.onClick}
  >
    <Box fontSize={24}>{props.count}</Box>
    <Box
      style={{
        textTransform: 'uppercase',
        fontSize: 12,
      }}
    >
      {props.label}
    </Box>
  </Column>
)

const Details = () => {
  const ctx = useCriterion()
  const [activeView, setActiveView] = useState(DetailView.Reviews)
  const ActiveView = DetailViews[activeView]

  return (
    <Column width="100%" minHeight={600}>
      <Row width="100%" justifyContent="center" marginBottom={10} gap={10}>
        <DetailTab
          label="Reviews"
          count={ctx.data.reviews.length}
          view={DetailView.Reviews}
          activeView={activeView}
          onClick={() => setActiveView(DetailView.Reviews)}
        />
        {/* <DetailTab
          label="Responses"
          count={ctx.data.responses.length}
          view={DetailView.Responses}
          activeView={activeView}
          onClick={() => setActiveView(DetailView.Responses)}
        />
        <DetailTab
          label="Triggers"
          count={ctx.data.triggers.length}
          view={DetailView.Triggers}
          activeView={activeView}
          onClick={() => setActiveView(DetailView.Triggers)}
        /> */}
      </Row>
      <ActiveView />
    </Column>
  )
}

const GroupsBreakdown = () => {
  const ctx = useCriterion()
  const npsGroups = ctx.data.currentStats.nps_groups
  const chart = npsGroupsBreakdown(
    ['Promoters', 'Passives', 'Detractors'],
    [
      npsGroups.promoters.count,
      npsGroups.passives.count,
      npsGroups.detractors.count,
    ],
  )

  return (
    <Box height={300} width="100%">
      <Bar options={{ ...bar.options, ...chart.options }} data={chart.data} />
    </Box>
  )
}

const RatingsBreakdown = () => {
  const ctx = useCriterion()
  const ratingGroups = ctx.data.currentStats.rating_groups
  const chart = ratingGroupsBreakdown(
    Object.keys(ratingGroups).map((_, i) => i),
    Object.values(ratingGroups).map((x) => x.count),
  )

  return (
    <Box height={300} width="100%">
      <Bar options={{ ...bar.options, ...chart.options }} data={chart.data} />
    </Box>
  )
}

// Shared

type StatsBlockProps = {
  label: string
  previousValue: number
  currentValue: number
  type?: 'percentage' | 'number'
  fontSize?: number
}
const StatsBlock = (props: StatsBlockProps) => {
  const {
    fontSize = 36,
    type = 'number',
    currentValue,
    previousValue,
    label,
  } = props
  const ctx = useCriterion()
  const doCompare = Boolean(ctx.dateRange !== DateRange.ALL_TIME)

  return (
    <Column>
      <Label
        style={{
          marginBottom: 20,
        }}
        text={label}
      />
      <Box fontSize={fontSize} marginTop="auto" marginBottom={6}>
        {currentValue}
        {props.type === 'percentage' && '%'}
      </Box>
      {doCompare && (
        <Comparison
          type={type}
          currentValue={currentValue}
          previousValue={previousValue}
        />
      )}
    </Column>
  )
}

type ComparisonProps = {
  type: 'percentage' | 'number'
  previousValue: number
  currentValue: number
}
export const Comparison = (props: ComparisonProps) => {
  const diff = props.currentValue - props.previousValue
  const percentChange = diff / props.previousValue
  const color = diff < 0 ? Color.red.normal : Color.green.normal

  return (
    <Row style={{ fontSize: 13 }}>
      <Row
        style={{
          color,
          marginRight: 10,
        }}
      >
        <TextItem
          text={`${Math.abs(percentChange).toFixed(2)}%`}
          icon={diff < 0 ? 'faArrowDown' : 'faArrowUp'}
        />
      </Row>
      <Row opacity={0.7}>
        <TextItem
          text={diff % 1 === 0 ? Math.abs(diff) : Math.abs(diff).toFixed(2)}
          icon={diff < 0 ? 'faMinus' : 'faPlus'}
          iconMargin={0}
        />
        {props.type === 'percentage' && '%'}
      </Row>
    </Row>
  )
}

const Section = ({
  children,
  style = {},
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) => {
  return (
    <Row
      width="100%"
      marginTop={10}
      marginBottom={30}
      padding={40}
      background="rgba(0,0,0,15%)"
      alignItems="stretch"
      style={style}
    >
      {children}
    </Row>
  )
}
