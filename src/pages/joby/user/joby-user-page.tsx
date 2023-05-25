import * as Rm from '@rainmaker/ui'
import * as React from 'react'
import { useParams } from 'react-router-dom'
import { useAdmin } from '../../../Admin'
import { Page } from '../../../Page'
import { Broadcast, BroadcastsTable } from '../../../components/BroadcastsTable'
import { Button, Heading2, IconButton, Label, TextItem } from '../../../ui'
import { Box, Column, Row } from '../../../ui/Layout'
import { PlatformBubble } from '../../../ui/icons/PlatformBubble'
import { fetchAPI } from '../../../utils/fetch-api'
import {
  ChargebeeIcon,
  RoleBadge,
} from '../../studio/user/studio-user-components'
import * as Joby from '../joby-types'

// **********************
// * API RESPONSE TYPES *
// **********************

type ProjectsResponse = Array<Joby.Project>

// *************
// * API CALLS *
// *************

async function getProjects(userId: string): Promise<ProjectsResponse> {
  const response = await fetch(`/api/apistream/users/${userId}/projects`)
  return response.json()
}

async function getBroadcasts({
  userId,
  page,
  limit,
}: {
  userId: string
  page: number
  limit: number
}): Promise<Broadcast[]> {
  const response = await fetchAPI(
    `/api/users/${userId}/broadcasts?page=${page}&limit=${limit}`,
  )
  return response.list
}

async function getUser(userId: string): Promise<Joby.User> {
  const response = await fetchAPI(`/api/users/${userId}`, {
    method: 'POST',
    body: JSON.stringify({ productFilter: 'jobyStudio' }),
  })
  return response
}

// ***********************
// * Utility Components *
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
      }}
    >
      {props.children}
    </div>
  )
}

const rowStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
}

const columnStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
}

// ********************
// * PROJECTS SECTION *
// ********************

const ProjectPanel = (props: { project: Joby.Project }) => {
  return (
    <Panel>
      <Column style={{ ...columnStyle, alignItems: 'stretch' }}>
        <Row style={rowStyle}>
          <Column
            style={{ ...columnStyle, alignItems: 'flex-start', width: '50%' }}
          >
            <Label text="Project ID:" />
            <TextItem text={props.project.projectId} />
          </Column>
          <Column
            style={{ ...columnStyle, alignItems: 'flex-start', width: '50%' }}
          >
            <Label text="Collection ID" />
            <TextItem text={props.project.collectionId} />
          </Column>
        </Row>
        <Row style={rowStyle}>
          <Column
            style={{ ...columnStyle, alignItems: 'flex-start', width: '50%' }}
          >
            <Label text="Layout ID:" />
            <TextItem text={props.project.metadata?.layoutId} />
          </Column>
          <Column
            style={{ ...columnStyle, alignItems: 'flex-start', width: '50%' }}
          >
            <Label text="Geolocation" />
            <Row style={rowStyle}>
              <TextItem
                text={`${props.project.location.latitude}, ${props.project.location.longitude}`}
              />
              <Rm.Tooltip
                variant="detailed"
                position="top"
                message="This location is determined when the user signs up, and is used for placing broadcasts (both the Engine and WebRTC)."
              >
                <IconButton icon="faInfoCircle" />
              </Rm.Tooltip>
            </Row>
          </Column>
        </Row>
      </Column>
    </Panel>
  )
}

// ************************
// * Destinations Section *
// ************************

const DestinationItem = ({
  destination,
}: {
  destination: Joby.Destination
}) => {
  const openDestination = (d: Joby.Destination) => {
    switch (d.metadata.props.type) {
      case Joby.AuthDestinations.Twitch: {
        window.open(`https://twitch.tv/${d.metadata.props.username}`, '_blank')
        break
      }
      case Joby.AuthDestinations.Facebook: {
        const targetId = d.metadata.props.settings?.streamDestination?.id
        if (targetId) {
          window.open(`https://facebook.com/${targetId}`, '_blank')
        }
        break
      }
      default:
        break
    }
  }

  return (
    <Row style={{ ...rowStyle, paddingTop: 8, paddingBottom: 8 }}>
      <Row style={{ ...rowStyle, justifyContent: 'flex-start' }}>
        <div
          style={{
            height: 29,
            width: 50,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PlatformBubble type={destination.metadata.props.type} />
        </div>
        <TextItem
          text={
            destination.metadata.props?.username ?? destination.destinationId
          }
        />
        {destination.enabled && (
          <div
            style={{
              marginLeft: 8,
              borderRadius: 8,
              height: 16,
              width: 16,
              background: '#26ad80',
            }}
          />
        )}
      </Row>
      <Rm.Tooltip position="top" message="View Channel" variant="detailed">
        <IconButton
          icon="faExternalLink"
          onClick={() => {
            openDestination(destination)
          }}
        />
      </Rm.Tooltip>
    </Row>
  )
}

const DestinationsPanel = (props: { destinations: Joby.Destination[] }) => {
  return (
    <Panel>
      {props.destinations.map((d, i) => (
        <DestinationItem destination={d} key={i} />
      ))}
    </Panel>
  )
}

// ********************
// * Broadcasts Table *
// ********************

const broadcastsReducer: React.Reducer<Broadcast[], Broadcast[]> = (
  prevState,
  action,
) => action || prevState

const BroadcastsPanel = (props: { userId: string }) => {
  const [limit] = React.useState(25)
  const [broadcasts, dispatchBroadcasts] = React.useReducer(
    broadcastsReducer,
    [],
  )
  const [page, setPage] = React.useState(0)
  React.useEffect(() => {
    if (props.userId) {
      getBroadcasts({
        userId: props.userId,
        page,
        limit,
      }).then(dispatchBroadcasts)
    }
  }, [props.userId, page, limit])
  return (
    <BroadcastsTable
      limit={limit}
      total={broadcasts.length}
      page={page}
      data={broadcasts}
      onChange={({ page }) => {
        setPage(page)
      }}
    />
  )
}

// ****************************
// * User Page Header Section *
// ****************************

enum SubscriptionLevel {
  Free = 0,
  Premium = 1,
  VIP = 2,
}

enum SubscriptionTier {
  Free = 'free',
  Premium = 'premium',
  VIP = 'vip',
}

const tierToLevel = (tier: string) => {
  switch (tier) {
    case SubscriptionTier.VIP:
      return SubscriptionLevel.VIP
    case SubscriptionTier.Premium:
      return SubscriptionLevel.Premium
    case SubscriptionTier.Free:
    default:
      return SubscriptionLevel.Free
  }
}

const bestSub = (subs: Joby.SubscriptionItem[]) => {
  const tiers = subs.map((s) => s.item_price_id.split('-')[0].toLowerCase())
  const best = tiers.reduce((a, b) => {
    if (tierToLevel(a) > tierToLevel(b)) {
      return a
    } else {
      return b
    }
  }, 'free')
  return best
}

const Header = ({ user }: { user: Joby.User }) => {
  const { admin } = useAdmin()
  const [impersonationLoading, setImpersonationLoading] = React.useState(false)

  const impersonateUser = React.useCallback(async () => {
    setImpersonationLoading(true)
    const response = await fetch(
      `/api/apistream/users/${user.id}/impersonate`,
      {
        method: 'POST',
      },
    )
    const body = await response.json()
    const base =
      body.env === 'prod'
        ? 'https://stream.jobystudio.com/admin?commandToken='
        : 'https://stream.jobystudio.silly.horse/admin?commandToken='
    window.open(`${base}${body.token}`, '_blank')
    setImpersonationLoading(false)
  }, [user])

  if (user) {
    return (
      <Row style={{ justifyContent: 'space-between', marginBottom: 20 }}>
        <Column>
          <Row>
            <Heading2 text={user.email} />
            <RoleBadge
              marginLeft={20}
              role={bestSub(
                user.subscriptions.flatMap((s) => s.subscription_items),
              )}
            />
            <ChargebeeIcon
              customerId={user.id}
              baseUrl="https://joby-studio.chargebee.com"
              marginLeft={6}
            />
          </Row>
          <Row>
            <Label text={user.id} />
            <Box style={{ marginLeft: 5 }}>
              <Label text="|" />
            </Box>
            <Box style={{ marginLeft: 5 }}>
              <Label
                text={`Created ${new Date(
                  user.createdAt,
                ).toLocaleDateString()}`}
              />
            </Box>
            <Box style={{ marginLeft: 5 }}>
              <Label text="|" />
            </Box>
            <Box style={{ marginLeft: 5 }}>
              <Label
                text={`Created ${new Date(
                  user.lastLoggedInAt,
                ).toLocaleDateString()}`}
              />
            </Box>
          </Row>
        </Column>
        <Rm.Tooltip
          variant="detailed"
          message={`Impersonate User.${
            admin?.permissions.studio2ImpersonateProject
              ? ''
              : ' You do not have permission to use this feature.'
          }`}
        >
          <Button
            text="Impersonate"
            onClick={impersonateUser}
            disabled={
              !admin?.permissions.studio2ImpersonateProject ||
              impersonationLoading
            }
          />
        </Rm.Tooltip>
      </Row>
    )
  }
  return <></>
}

// Reducers

const userReducer: React.Reducer<Joby.User, Joby.User> = (prevState, action) =>
  action || prevState
const projectsReducer: React.Reducer<ProjectsResponse, ProjectsResponse> = (
  prevState: ProjectsResponse,
  action: ProjectsResponse,
) => action || prevState

// Full Page

export const JobyUserPage = () => {
  const { id: userId } = useParams()
  const [projects, dispatchProjects] = React.useReducer(projectsReducer, [])
  const [user, dispatchUser] = React.useReducer(userReducer, null)

  React.useEffect(() => {
    if (userId) {
      getProjects(userId).then(dispatchProjects)
    }
  }, [userId])

  React.useEffect(() => {
    if (userId) {
      getUser(userId).then(dispatchUser)
    }
  }, [userId])

  return (
    <Page title={'JOBY - ' + user?.email}>
      <Header user={user} />
      {projects.map((p) => (
        <ProjectPanel project={p} key={p.projectId} />
      ))}
      <div style={{ marginTop: 20 }}>
        <DestinationsPanel
          destinations={projects.flatMap((p) => p.destinations)}
        />
      </div>
      <div style={{ marginTop: 20 }}>
        <BroadcastsPanel userId={userId} />
      </div>
    </Page>
  )
}
