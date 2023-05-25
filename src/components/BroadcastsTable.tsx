import * as Rm from '@rainmaker/ui'
import moment from 'moment'
import * as React from 'react'
import { useAdmin } from '../Admin'
import { useSidebar } from '../SideBar'
import { Platform } from '../pages/studio/studio-types'
import {
  BasicModal,
  Body,
  Button,
  CancelButton,
  Heading2,
  Heading3,
  IconButton,
  Label,
  TextInput,
  TextItem,
} from '../ui'
import { Box, Column, Row } from '../ui/Layout'
import { PlatformBubbleList } from '../ui/icons/PlatformBubble'
import { copyToClipboard } from '../utils/helpers'

/**
 * Broadcast report object from the analytics database in Cloud SQL (PostgreSQL).
 */
export type Broadcast = {
  broadcastId: string
  /** The title of the project being used to broadcast. */
  title: string
  /**  The amount of time the broadcast has been live (formatted). */
  length: string
  /** The length of the stream in milliseconds. */
  rawLength: 7862
  /** or string */
  startDate: Date
  /** or string */
  rawStartDate: Date
  /**
   * if 'rtmp indicator-jobystudio' then joby studio
   */
  iconClass: string
  aborted: boolean
  activeSceneAssets?: any[]
  canceled: boolean
  destinations?: any[]
  engineInfo?: any
  failed: boolean
  followers?: number
  isJobyStudio?: boolean
  isStudioV2?: boolean
  origin: string
  platform: string
  projectId?: string
  projectType: string
  providerId?: string
  region: string
  searchLink?: string
  service: string
  sessionId: string
  shortTitle: string
  shortUser: string
  url?: string
  user: string
  userId: string
  webrtcUrl?: string
  weekday?: string
  createDetails?: {
    cause: string
    origin: string
    region: string
  }
  stopDetails?: {
    cause: string
    origin: string
    reason: string
  }
  rawData: object
}

// ************************
// * Flag Broadcast Modal *
// ************************

const FlagBroadcastDialog = ({
  broadcast,
  onComplete,
}: {
  broadcast: Broadcast
  onComplete: () => void
}) => {
  const [report, setReport] = React.useState('')
  const { admin } = useAdmin()

  const flagBroadcast = React.useCallback(async () => {
    if (!Boolean(report)) {
      Rm.Toasts.error('Please give a reason for flagging this broadcast')
    } else {
      const actionResponse = await fetch(`/api/admins/${admin.id}/action`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'flagBroadcast',
          meta: {
            broadcast_id: broadcast.broadcastId,
          },
          email: admin.email,
        }),
        headers: new Headers({
          'content-type': 'application/json;charset=utf-8',
        }),
      }).then((res) => res.json())

      const body = JSON.stringify({
        action_id: actionResponse.id,
        owner_id: broadcast.userId,
        flagged_reason: report,
      })
      const flagResponse = await fetch(
        `/api/broadcasts/${broadcast.broadcastId}/flag`,
        {
          method: 'POST',
          body,
          headers: new Headers({
            'content-type': 'application/json;charset=utf-8',
          }),
        },
      ).then((res) => res.json())
      // TODO: Update any state necessary
      onComplete()
      return flagResponse
    }
  }, [report, admin])
  const name = `${admin?.firstName} ${admin?.lastName}`
  return (
    <Column gap={10} padding={32} width={400} alignItems="center">
      <Heading2 text="Flag Broadcast" />
      <Body text={broadcast.title} />
      <Body text={broadcast.user} bold={true} />
      <TextInput
        label={<Label fontSize={12} text={`Reporter: ${name}`} />}
        appearance="outline"
        placeholder="Reason for flagging..."
        multiline={true}
        value={report}
        onChange={(e) => setReport(e.target.value)}
        minHeight={80}
        autoHeight={true}
      />
      <Row gap={8} marginTop={20}>
        <CancelButton onClick={onComplete} />
        <Button text="Flag" onClick={flagBroadcast} />
      </Row>
    </Column>
  )
}

// **********************************
// * Broadcast Details (in SideBar) *
// **********************************

const DetailsRow = ({ prop, value }: { prop: string; value: any }) => {
  const printed = React.useMemo(
    () =>
      typeof value === 'object'
        ? JSON.stringify(value, undefined, 2)
        : value.toString(),
    [value],
  )

  return (
    <Row
      gap={8}
      style={{
        flexWrap: 'nowrap',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      }}
    >
      <Box minWidth={110}>
        <Label text={prop} />
      </Box>
      <Body text={printed} selectOnClick={true} />
    </Row>
  )
}

const BroadcastDetails: React.FC<{ broadcast: Broadcast }> = ({
  broadcast,
}: {
  broadcast: Broadcast
}) => {
  React.useEffect(() => {}, [broadcast])
  return (
    <Column
      gap={10}
      style={{
        height: '100%',
        overflowY: 'auto',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
      }}
    >
      {Object.entries(broadcast)
        .filter(([, v]) => Boolean(v))
        .map(([k, v]) => (
          <DetailsRow prop={k} value={v} key={k} />
        ))}
    </Column>
  )
}

// ********************
// * Broadcasts Table *
// ********************

const BroadcastRow = ({ item }: { item: Broadcast; odd: boolean }) => {
  const { setSidebar } = useSidebar()

  const viewDetails = React.useMemo(() => {
    return () => {
      setSidebar({
        header: (
          <Row alignItems="center">
            <PlatformBubbleList
              platforms={platformsFromIconClass(item.iconClass)}
            />
            <Column style={{ marginLeft: 10 }}>
              <TextItem fontSize={22} text={item.user} />
              <TextItem fontSize={14} opacity={0.7} text={item.title} />
            </Column>
          </Row>
        ),
        body: <BroadcastDetails broadcast={item} />,
      })
    }
  }, [item])

  const [isFlagModalOpen, setIsFlagModalOpen] = React.useState(false)

  const copyBroadcastId = React.useMemo(() => {
    return () => copyToClipboard(item.broadcastId)
  }, [item])

  const copySlackSearch = React.useMemo(() => {
    return async () => {
      const date = new Date(item.startDate)
      const dateString = date.toISOString().slice(0, 10)
      const text = `${item.sessionId} ${item.shortUser} in:#ls-eng-notifications on: ${dateString}`
      copyToClipboard(text)
    }
  }, [item])

  return (
    <>
      <Rm.TableRowItem>
        <Row gap={12}>
          <PlatformBubbleList
            size={28}
            platforms={platformsFromIconClass(item.iconClass)}
          />
          {item.title ? (
            <Body
              ellipsis={true}
              text={item.shortTitle ? item.shortTitle : item.title}
            />
          ) : (
            <Body text="No title" opacity={0.7} />
          )}
        </Row>
      </Rm.TableRowItem>
      <Rm.TableRowItem width={50}>
        <Row alignItems="center">
          <Rm.Tooltip position="top" message="region" variant="detailed">
            <IconButton icon="faGlobeAmericas" />
          </Rm.Tooltip>
          {item.region}
        </Row>
      </Rm.TableRowItem>
      <Rm.TableRowItem width={150}>
        <Row alignItems="center">
          <Rm.Tooltip
            position="top"
            message={`Started at: ${new Date(item.startDate).toUTCString()}`}
            variant="detailed"
          >
            <IconButton
              icon="faCalendarAlt"
              onClick={() =>
                copyToClipboard(new Date(item.startDate).toUTCString())
              }
            />
            {moment(item.startDate).format('MMMM D, YYYY')}
          </Rm.Tooltip>
        </Row>
      </Rm.TableRowItem>
      <Rm.TableRowItem width={100}>
        <Row alignItems="center">
          <IconButton icon="faClock" />
          {item.length}
        </Row>
      </Rm.TableRowItem>
      <Rm.TableRowItem width={50}>
        <Rm.Tooltip
          position="top"
          message="View Broadcast Details"
          variant="detailed"
        >
          <IconButton icon="faInfo" onClick={viewDetails} />
        </Rm.Tooltip>
      </Rm.TableRowItem>
      <Rm.TableRowItem width={50}>
        <Rm.Tooltip position="top" message="Flag Broadcast" variant="detailed">
          <IconButton icon="faFlag" onClick={() => setIsFlagModalOpen(true)} />
          <BasicModal
            showX={true}
            isOpen={isFlagModalOpen}
            onClose={() => setIsFlagModalOpen(false)}
          >
            <FlagBroadcastDialog
              broadcast={item}
              onComplete={() => setIsFlagModalOpen(false)}
            />
          </BasicModal>
        </Rm.Tooltip>
      </Rm.TableRowItem>
      <Rm.TableRowItem width={50}>
        <Rm.Tooltip
          position="top"
          message="Copy Broadcast ID"
          variant="detailed"
        >
          <IconButton icon="faFingerprint" onClick={copyBroadcastId} />
        </Rm.Tooltip>
      </Rm.TableRowItem>
      <Rm.TableRowItem width={50}>
        <Rm.Tooltip
          position="top"
          message="Copy Slack Broadcast Search"
          variant="detailed"
        >
          <IconButton icon="faSearch" onClick={copySlackSearch} />
        </Rm.Tooltip>
      </Rm.TableRowItem>
    </>
  )
}

export const BroadcastsTable = (props: {
  limit: number
  total: number
  page: number
  data: Broadcast[]
  onChange: (data: { page: number; limit: number; order?: string }) => void
}) => {
  return (
    <Rm.PaginatedTable
      limit={props.limit}
      total={props.data.length}
      defaultSort={'startDate:broadcastId'}
      fetching={false}
      page={props.page}
      data={props.data}
      onChange={props.onChange}
      rowComponent={BroadcastRow}
    />
  )
}

// For reasons unknown at this point, broadcasts contain
//  platform information only in the form of 'iconClass'
const platformsFromIconClass = (classList: string) => {
  const classes = classList.split(' ')
  const re = /platform-icon-(\w+)\b/g
  const ds: string[] = []
  classes.forEach((c) => {
    if (re.test(c)) {
      ds.push(RegExp.$1)
    }
  })
  return ds
    .map((d) => d.toLowerCase())
    .map((d) => {
      switch (d) {
        case 'twitchtv':
        case 'twitch':
        case 'twitchtv-inactive':
        case 'twitch-inactive':
          return Platform.Twitch
        case 'facebook':
        case 'facebook-inactive':
          return Platform.Facebook
        case 'youtube':
        case 'youtube-inactive':
          return Platform.YouTube
        default:
          return Platform.CustomRTMP
      }
    })
}
