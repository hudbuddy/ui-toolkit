import moment from 'moment'
import { useCallback, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import { useParams } from 'react-router-dom'
import { useAdmin } from '../../../Admin'
import { Page } from '../../../Page'
import { useSidebar } from '../../../SideBar'
import { Heading2 } from '../../../ui'
import { Box, Column, Row, WrapBox, wrapBox } from '../../../ui/Layout'
import { Button } from '../../../ui/buttons/Button'
import { BrandBubbleList } from '../../../ui/icons/BrandBubble'
import { FaIcon } from '../../../ui/icons/Icon'
import { bar } from '../../../utils/chart'
import { userBroadcastOverview } from './studio-user-charts'
import {
  ChargebeeIcon,
  DataPolicyIcon,
  DetailLabel,
  DetailSpacer,
  ListButton,
  OverviewLabel,
  OverviewMetric,
  RoleBadge,
  getRoleForUser,
} from './studio-user-components'
import {
  StudioUserProvider,
  useCurrentStudioUser,
  useStudio,
} from './studio-user-context'

const panelBackground = 'rgba(0, 0, 0, 0.15)'

export const StudioUserPage = () => {
  return (
    <StudioUserProvider>
      <Content />
    </StudioUserProvider>
  )
}

const Content = () => {
  const { id } = useParams()
  const { fetchUser, isFetchingId } = useStudio()
  const user = useCurrentStudioUser()

  useEffect(() => {
    // Refresh the user state
    fetchUser(id)
  }, [id])

  if (!user) {
    if (isFetchingId === id) {
      return <Row>Loading user data...</Row>
    } else {
      return <Row>User not found</Row>
    }
  }

  return (
    <Page title={'Studio - ' + user.displayName ?? user.email}>
      <WrapBox C={Header} marginBottom={20} width="100%" />
      <Body />
    </Page>
  )
}

const Header = () => {
  return (
    <Row
      justifyContent="space-between"
      width="100%"
      flexWrap="wrap-reverse"
      gap={10}
    >
      <HeaderLeft flex="0 0 auto" />
      <HeaderRight flex="0 0 auto" />
    </Row>
  )
}

const HeaderLeft = wrapBox(() => {
  const user = useCurrentStudioUser()
  const twitchProviderId = user.accounts.find(
    (x) => x.type === 'twitchtv',
  )?.providerId

  return (
    <Column>
      <Row width="100%" alignItems="flex-end" marginBottom={10}>
        <Row>
          <h3>{user.displayName ?? user.email}</h3>
          <DataPolicyIcon
            marginLeft={8}
            accepted={user.hasAcceptedDataPolicy}
          />
          <RoleBadge marginLeft={20} role={getRoleForUser(user)} />
          <ChargebeeIcon
            customerId={user.subscription.customerId}
            baseUrl="https://lightstream.chargebee.com"
            marginLeft={6}
          />
        </Row>
        <BrandBubbleList
          size={29}
          names={user.accounts.map((x) => x.type)}
          marginLeft={20}
        />
      </Row>
      <Row>
        <DetailLabel>{user.email}</DetailLabel>
        <DetailSpacer />
        <DetailLabel>Joined {user.createdAt}</DetailLabel>
        {twitchProviderId && (
          <>
            <DetailSpacer />
            <DetailLabel>Twitch ID: {twitchProviderId}</DetailLabel>
          </>
        )}
      </Row>
    </Column>
  )
})

const HeaderRight = wrapBox(() => {
  const { admin } = useAdmin()
  const { status } = useCurrentStudioUser()
  const { liveBroadcast, isLive, flaggedBroadcastCount } = status

  return (
    <Row>
      <Row
        marginRight={16}
        cursor="pointer"
        style={{
          color: 'orange',
        }}
        hover={{
          color: 'white',
        }}
        onClick={() => {
          // TODO: Flag broadcast
        }}
      >
        <FaIcon name="faFlag" type="solid" height={18} width={18} />
        <Box marginLeft={4} fontSize={12}>
          {flaggedBroadcastCount}
        </Box>
      </Row>
      <WrapBox
        C={Button}
        text="Game Source"
        appearance="outline"
        disabled={!isLive}
        fields={{
          link: status.gameSourceUrl,
          tooltip: 'View game source',
          hidden:
            !admin.permissions.viewMixerFeedEnabled || !status.gameSourceUrl,
        }}
      />
      <WrapBox
        C={Button}
        text="Watch Live"
        appearance="solid"
        marginLeft={8}
        disabled={!isLive}
        fields={{
          // @ts-ignore TODO:
          link: isLive ? liveBroadcast.url : null,
          // @ts-ignore TODO:
          tooltip: isLive ? liveBroadcast.url : 'Offline',
        }}
      />
    </Row>
  )
})

const Body = () => {
  const user = useCurrentStudioUser()

  return (
    <Column width="100%">
      <Row gap={20} width="100%" alignItems="stretch">
        <Box flex="1 1 500px">
          <Overview />
        </Box>
        <Column
          gap={20}
          justifyContent="space-between"
          flex="1 0 200px"
          maxWidth={300}
        >
          <ControlPanel />
          <NPS />
        </Column>
      </Row>
      <ProjectPanel />
      {/* {' '}
      <div style={{ marginTop: 20 }}>
        <DestinationsPanel
          destinations={projects.flatMap((p) => p.destinations)}
        />
      </div>
      <div style={{ marginTop: 20 }}>
        <BroadcastsPanel userId={userId} />
      </div>{' '} */}
    </Column>
  )
}

const Overview = () => {
  const { status, broadcastChartData } = useCurrentStudioUser()
  const chart = userBroadcastOverview(
    broadcastChartData.labels,
    broadcastChartData.data,
    moment().format('MMMM'),
    moment().format('YYYY'),
  )

  return (
    <Column background={panelBackground} padding={40} flex="1 1 0">
      <Row width="100%">
        <Column>
          <OverviewLabel>Total</OverviewLabel>
          <OverviewMetric>{status.broadcastsTotal}</OverviewMetric>
        </Column>
        <Column marginLeft={80}>
          <OverviewLabel>Time</OverviewLabel>
          <Row gap={6}>
            <OverviewMetric suffix="h">
              {status.timeBroadcastedFormatted.hours}
            </OverviewMetric>
            <OverviewMetric suffix="m">
              {status.timeBroadcastedFormatted.minutes}
            </OverviewMetric>
          </Row>
        </Column>
        <Column marginLeft={80}>
          <OverviewLabel>Success Rate</OverviewLabel>
          <OverviewMetric suffix="%">
            {status.successPercentageFormatted}
          </OverviewMetric>
        </Column>
      </Row>
      {/* Graph */}
      <Box height={240} width="100%" marginTop={20}>
        <Bar options={{ ...bar.options, ...chart.options }} data={chart.data} />
      </Box>
    </Column>
  )
}

const ControlPanel = () => {
  const user = useCurrentStudioUser()

  return (
    <Column
      background={panelBackground}
      padding={20}
      width="100%"
      alignItems="stretch"
      gap={10}
    >
      {/* TODO: */}
      <ListButton>Admin Activity</ListButton>
      {/* TODO: */}
      <ListButton>Studio Commands</ListButton>
      {/* TODO: */}
      <ListButton>Subscription</ListButton>
    </Column>
  )
}

const NPS = () => {
  const { criterion } = useCurrentStudioUser()
  const { setSidebar } = useSidebar()

  // TODO: Iterate attempts - if reviewed=true, populate with review data

  const viewResponses = useCallback(() => {
    setSidebar({
      header: (
        <Row alignItems="center">
          <Heading2 text="Criterion Review History" />
        </Row>
      ),
      body: <Column></Column>,
    })
  }, [])

  return (
    <Column background={panelBackground} padding={20}>
      <OverviewLabel>NPS</OverviewLabel>
      <Row gap={30} justifyContent="space-between">
        <Column fontSize={44} style={{ color: '#26ad80' }}>
          {criterion.averageRating}
        </Column>
        <Column gap={6} alignItems="center">
          <Row fontSize={18}>{criterion.reviews.length}</Row>
          <Row fontSize={12} opacity={0.5}>
            Reviews
          </Row>
        </Column>
        <Column gap={6} alignItems="center">
          <Row fontSize={18}>{criterion.attempts.length}</Row>
          <Row fontSize={12} opacity={0.5}>
            Attempts
          </Row>
        </Column>
      </Row>
      <ListButton marginTop={14} onClick={() => viewResponses}>
        View Responses
      </ListButton>
    </Column>
  )
}

const ProjectPanel = () => {
  const { projects } = useCurrentStudioUser()

  return (
    <Column>
      {projects.map((p) => (
        <Row key={p.id}>{p.title}</Row>
      ))}
    </Column>
  )
}
