import * as RM from '@rainmaker/ui'
import { startCase } from 'lodash'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { useParams } from 'react-router-dom'
import { style } from 'typestyle'
import { useAdmin } from '../../../Admin'
import { DetailTab } from '../../../components/DetailTab'
import { Page } from '../../../Page'
import { useSidebar } from '../../../SideBar'
import {
  Checkbox,
  Color,
  Heading2,
  Label,
  TextItem,
  WithDropdown,
} from '../../../ui'
import { Box, Column, Row, WrapBox, wrapBox } from '../../../ui/Layout'
import {
  Button,
  IconButton,
  IconButtonCircle,
} from '../../../ui/buttons/Button'
import { BrandBubbleList } from '../../../ui/icons/BrandBubble'
import { FaIcon } from '../../../ui/icons/Icon'
import { bar } from '../../../utils/chart'
import { StudioUserAccounts } from './studio-user-accounts'
import { StudioUserBroadcasts } from './studio-user-broadcasts'
import { userBroadcastOverview } from './studio-user-charts'
import {
  ChargebeeIcon,
  CriterionReviewHistory,
  DataPolicyIcon,
  DetailLabel,
  DetailSpacer,
  Disabled,
  ListButton,
  OverviewLabel,
  OverviewMetric,
  RoleBadge,
  SubscriptionBadge,
  getNpsColor,
  getRoleForUser,
} from './studio-user-components'
import {
  CurrentUser,
  StudioUserProvider,
  useCurrentStudioUser,
  useStudio,
} from './studio-user-context'
import { StudioUserProjects } from './studio-user-projects'

const panelBackground = 'rgba(0, 0, 0, 0.15)'

const pulseClass = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 30,
  height: 30,
  borderRadius: '50%',
  backgroundColor: Color.secondary(300),
  transform: 'translate(-50%, -50%)',
  transformOrigin: '0 0',
  opacity: 0,
  zIndex: -1,
  animation: 'pulse 1.8s linear infinite',
})

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
      <WrapBox
        C={Header}
        paddingBottom={10}
        marginBottom={10}
        width="100%"
        style={{
          position: 'sticky',
          top: 0,
          background: '#2c2c3c',
          zIndex: 1,
          borderBottom: '1px solid rgb(255 255 255 / 9%)'
        }}
      />
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
      maxWidth={1040}
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
          <TextItem text={user.displayName ?? user.email} fontSize={24} />
          <DataPolicyIcon
            marginLeft={8}
            accepted={user.hasAcceptedDataPolicy}
          />
          <SubscriptionBadge marginLeft={20} role={getRoleForUser(user)} />
          {user.subscription && (
            <ChargebeeIcon
              customerId={user.subscription.customerId}
              baseUrl="https://lightstream.chargebee.com"
              marginLeft={6}
            />
          )}
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
      <Row marginTop={8}>
        <UserRoles />
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
      <Disabled>
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
      </Disabled>
      <WrapBox
        C={Button}
        text="Game Source"
        appearance="outline"
        color="neutral"
        disabled={!isLive}
        height={25}
        fields={{
          href: status.gameSourceUrl,
          target: '_blank',
          tooltip: 'View game source',
          hidden:
            !admin.permissions.viewMixerFeedEnabled || !status.gameSourceUrl,
        }}
      />
      <Box
        href={isLive ? liveBroadcast.url : null}
        tooltip={isLive ? liveBroadcast.url : 'Offline'}
        position="relative"
        marginLeft={4}
      >
        {isLive && <Box className={pulseClass} />}
        <Button
          text="Watch Live"
          appearance="solid"
          marginLeft={4}
          disabled={!isLive}
          color={isLive ? 'secondary' : 'neutral'}
        />
      </Box>
    </Row>
  )
})

const Body = () => {
  return (
    <Column width="100%">
      <Row gap={20} width="100%" alignItems="stretch">
        <Column flex="1 1 500px" overflow="hidden" maxWidth={720}>
          <Overview />
        </Column>
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
      <Row marginTop={20} maxWidth={1040}>
        <Details />
      </Row>
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
    <Column background={panelBackground} padding={30} flex="1 1 0">
      <Row width="100%" columnGap={56} rowGap={10} maxWidth="fit-content">
        <Column>
          <OverviewLabel>Total</OverviewLabel>
          <OverviewMetric>{status.broadcastsTotal}</OverviewMetric>
        </Column>
        <Column>
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
        <Column>
          <OverviewLabel>Success Rate</OverviewLabel>
          <OverviewMetric suffix="%">
            {status.successPercentageFormatted}
          </OverviewMetric>
        </Column>
      </Row>
      {/* Graph */}
      <Box
        height={220}
        width="100%"
        marginTop={20}
        position="relative"
        overflow="hidden"
      >
        <Bar options={{ ...bar.options, ...chart.options }} data={chart.data} />
      </Box>
    </Column>
  )
}

const ControlPanel = () => {
  const user = useCurrentStudioUser()
  const { setSidebar } = useSidebar()

  const viewSubscription = useCallback(() => {
    setSidebar({
      header: <Heading2 text="Subscription Details" />,
      body: <SubscriptionDetails user={user} />,
    })
  }, [user])

  return (
    <Column
      background={panelBackground}
      padding={20}
      width="100%"
      alignItems="stretch"
      gap={10}
    >
      <Disabled>
        <ListButton>Admin Activity</ListButton>
      </Disabled>
      <Disabled>
        <ListButton>Studio Commands</ListButton>
      </Disabled>
      <ListButton onClick={viewSubscription}>Subscription</ListButton>
    </Column>
  )
}

export const NPS = () => {
  const user = useCurrentStudioUser()
  const { setSidebar } = useSidebar()
  const { criterion } = user

  const viewResponses = useCallback(() => {
    setSidebar({
      header: <Heading2 text="Criterion History" />,
      body: <CriterionReviewHistory user={user} />,
    })
  }, [user])

  return (
    <Column background={panelBackground} padding={20}>
      <OverviewLabel>NPS</OverviewLabel>
      <Row gap={30} justifyContent="space-between">
        <Column
          fontSize={44}
          style={{ color: getNpsColor(Number(criterion.averageRating)) }}
        >
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
      <Row marginTop={14}>
        <ListButton onClick={() => viewResponses()}>View Responses</ListButton>
      </Row>
    </Column>
  )
}

const SubscriptionDetails = ({ user }: { user: CurrentUser }) => {
  if (!user.subscription) {
    return <TextItem muted={true} text="User has no subscription data" />
  }

  return (
    <Column gap={10}>
      {Object.entries(user.subscription).map(([key, val], i) => (
        <Row key={i} justifyContent="space-between">
          <Label text={startCase(key)} />
          <TextItem text={val} selectOnClick={true} />
        </Row>
      ))}
    </Column>
  )
}

const UserRoles = () => {
  const user = useCurrentStudioUser()
  const [isLocked, setIsLocked] = useState(true)
  const hasAnyRole = user.roles.length > 0

  return (
    <Row>
      {hasAnyRole && (
        <Box tooltip="Modify roles">
          <Checkbox
            checked={isLocked}
            onChange={setIsLocked}
            appearance="icon"
            content={
              <IconButton
                size={16}
                icon={isLocked ? 'faLockAlt' : 'faLockOpenAlt'}
                iconType="solid"
                colorWeight={!isLocked ? 0 : undefined}
              />
            }
          />
        </Box>
      )}
      <Row style={{ pointerEvents: isLocked ? 'none' : 'all' }}>
        {(!hasAnyRole || !isLocked) && (
          <WithDropdown
            marginLeft={4}
            node={
              <IconButtonCircle
                icon="faPlus"
                size={16}
                iconSize={14}
                colorWeight={500}
                disabled={isLocked && hasAnyRole}
                onClick={() => setIsLocked(false)}
              />
            }
            isOpen={!isLocked}
            onClose={() => setIsLocked(true)}
          >
            <Column
              gap={6}
              padding={8}
              style={{
                borderRadius: 6,
                background: Color.neutral(700),
              }}
            >
              {hasAnyRole && <TextItem text="Assign new role..." />}
              {user.availableRoles.map((x) => (
                <Button
                  key={x}
                  appearance="solid"
                  text={startCase(x)}
                  color="neutral"
                  disabled={user.roles.includes(x)}
                  height={24}
                  onClick={() => {
                    user.setRoles([...user.roles, x]).then(() => {
                      RM.Toasts.success('Role added to user', 3000)
                    })
                  }}
                />
              ))}
            </Column>
          </WithDropdown>
        )}
        {!hasAnyRole && (
          <TextItem
            text="Add a role..."
            fontSize={11}
            opacity={isLocked ? 0.4 : 1}
            italic={isLocked}
            marginLeft={6}
          />
        )}
        <Row gap={6} marginLeft={6}>
          {user.roles.map((x) => (
            <RoleBadge
              key={x}
              role={x}
              onRemove={() => {
                user
                  .setRoles(user.roles.filter((role) => role !== x))
                  .then(() => {
                    RM.Toasts.success('Role removed from user', 3000)
                  })
              }}
              canRemove={!isLocked}
            />
          ))}
        </Row>
      </Row>
    </Row>
  )
}

enum DetailView {
  Projects,
  Accounts,
  Broadcasts,
}

const DetailViews = {
  [DetailView.Projects]: StudioUserProjects,
  [DetailView.Accounts]: StudioUserAccounts,
  [DetailView.Broadcasts]: StudioUserBroadcasts,
}

const Details = () => {
  const user = useCurrentStudioUser()
  const { projectId } = useParams()
  const [activeView, setActiveView] = useState(DetailView.Projects)
  const ActiveView = DetailViews[activeView]

  useEffect(() => {
    if (projectId) setActiveView(DetailView.Projects)
  }, [projectId])

  return (
    <Column width="100%" minHeight={600}>
      <Row width={720} justifyContent="center" marginBottom={20} gap={10}>
        <DetailTab
          label="Projects"
          count={user.projects.length}
          isActive={DetailView.Projects === activeView}
          onClick={() => setActiveView(DetailView.Projects)}
        />
        <DetailTab
          label="Accounts"
          count={user.accounts.length}
          isActive={DetailView.Accounts === activeView}
          onClick={() => setActiveView(DetailView.Accounts)}
        />
        <DetailTab
          label="Broadcasts"
          count={user.broadcasts.list.length}
          isActive={DetailView.Broadcasts === activeView}
          onClick={() => setActiveView(DetailView.Broadcasts)}
        />
      </Row>
      <ActiveView />
    </Column>
  )
}
