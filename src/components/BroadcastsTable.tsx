import * as Rm from '@rainmaker/ui'
import moment from 'moment'
import * as React from 'react'
import { useAdmin } from '../Admin'
import { useSidebar } from '../SideBar'
import * as Studio from '../pages/studio/studio-types'
import {
  BasicModal,
  Body,
  Button,
  CancelButton,
  Heading2,
  Icon,
  IconButton,
  IconButtonCircle,
  Label,
  TextInput,
  TextItem,
} from '../ui'
import { Box, BrandBubble, BrandBubbleList, Column, Row } from '../ui/'
import { copyToClipboard } from '../utils/helpers'
import { RawData } from './RawData'
import { useNavigate } from 'react-router-dom'

// ************************
// * Flag Broadcast Modal *
// ************************

const FlagBroadcastDialog = ({
  broadcast,
  onComplete,
}: {
  broadcast: Studio.Broadcast
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
        ? JSON.stringify(value, undefined, '\t')
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
      {typeof value !== 'object' && (
        <Body text={printed} selectOnClick={true} />
      )}
      {typeof value === 'object' && <RawData data={value} />}
    </Row>
  )
}

const BroadcastDetails: React.FC<{ broadcast: Studio.Broadcast }> = ({
  broadcast,
}: {
  broadcast: Studio.Broadcast
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

const BroadcastRow = ({ item }: { item: Studio.Broadcast; odd: boolean }) => {
  const navigate = useNavigate()
  const { setSidebar } = useSidebar()

  const localTime = moment
    .utc(item.rawStartDate)
    .local()
    .format('MMM D YYYY h:mm A')
  const utcTime =
    moment.utc(item.rawStartDate).format('MMM D YYYY h:mm A') + ' UTC'

  const viewDetails = React.useMemo(() => {
    return () => {
      setSidebar({
        header: (
          <Row alignItems="center">
            <BrandBubbleList names={item.destinations || [item.platform]} />
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
          {/* Destination Icons */}
          <Box position="relative">
            {item.aborted && (
              <Box
                position="absolute"
                tooltip="Aborted"
                style={{
                  marginTop: -12,
                  top: '50%',
                  left: -26,
                }}
              >
                <Icon
                  name="Close"
                  color="secondary"
                  // type="solid"
                  size={24}
                  colorWeight={500}
                />
              </Box>
            )}
            <BrandBubbleList
              size={30}
              names={item.destinations || [item.platform]}
            />
            {item.projectType === 'mixer' && (
              <Box
                position="absolute"
                style={{
                  right: -3,
                  top: -3,
                }}
              >
                <BrandBubble name="xbox" size={14} />
              </Box>
            )}
          </Box>
          <Column>
            <TextItem
              href={`/studio/users/${item.userId}`}
              target="_blank"
              fontSize={15}
              text={item.user}
            />
            {item.title ? (
              <TextItem
                ellipsis={true}
                maxWidth={200}
                muted={true}
                text={item.shortTitle ? item.shortTitle : item.title}
              />
            ) : (
              <TextItem text="No title" opacity={0.5} />
            )}
          </Column>
        </Row>
      </Rm.TableRowItem>
      <Rm.TableRowItem width={80}>
        {/* Region */}
        <Row tooltip="Region">
          <TextItem
            text={item.region}
            icon="faGlobeAmericas"
            iconColorWeight={400}
          />
        </Row>
      </Rm.TableRowItem>
      <Rm.TableRowItem width={200}>
        <Row tooltip={`Started at: ${utcTime}`}>
          <TextItem
            text={localTime}
            icon="faCalendarAlt"
            iconColorWeight={400}
            cursor="pointer"
            onClick={() =>
              copyToClipboard(utcTime, 'Start date copied to clipboard as UTC')
            }
          />
        </Row>
      </Rm.TableRowItem>
      <Rm.TableRowItem width={100}>
        <Row tooltip="Runtime">
          <TextItem text={item.length} icon="faClock" iconColorWeight={400} />
        </Row>
      </Rm.TableRowItem>
      <Rm.TableRowItem width={50}>
        <Row tooltip="View Broadcast Details">
          <IconButton icon="faInfo" onClick={viewDetails} />
        </Row>
      </Rm.TableRowItem>
      <Rm.TableRowItem width={50}>
        <Row tooltip="Flag Broadcast">
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
        </Row>
      </Rm.TableRowItem>
      <Rm.TableRowItem width={50}>
        <Row tooltip="Copy Broadcast ID">
          <IconButton icon="faFingerprint" onClick={copyBroadcastId} />
        </Row>
      </Rm.TableRowItem>
      <Rm.TableRowItem width={50}>
        <Row tooltip="Copy Slack Broadcast Search">
          <IconButton icon="faSearch" onClick={copySlackSearch} />
        </Row>
      </Rm.TableRowItem>
      <Rm.TableRowItem width={50}>
        <Box tooltip="View project">
          <IconButtonCircle
            marginLeft={5}
            size={28}
            icon="faExternalLink"
            onClick={(e) => {
              navigate(`/v2/studio/users/${item.userId}`)
              window.setTimeout(() => {
                navigate(
                  `/v2/studio/users/${item.userId}/projects/${item.projectId}`,
                  { replace: true },
                )
              })
            }}
          />
        </Box>
      </Rm.TableRowItem>
    </>
  )
}

// Broadcast table that receives all broadcasts and self-manages state
export const BroadcastsTable = ({
  limit = 25,
  broadcasts = [],
}: {
  limit?: number
  broadcasts: Studio.Broadcast[]
}) => {
  const [_limit, setLimit] = React.useState(limit)
  const [page, setPage] = React.useState(0)

  const tableData = React.useMemo(
    () => broadcasts.slice(page * limit, (page + 1) * limit),
    [page, limit, broadcasts],
  )

  return (
    <Rm.PaginatedTable
      limit={_limit}
      total={broadcasts.length}
      defaultSort={'startDate:broadcastId'}
      fetching={false}
      page={page}
      data={tableData}
      onChange={({ page, limit }) => {
        setPage(page)
        setLimit(limit)
      }}
      rowComponent={BroadcastRow}
    />
  )
}

// Broadcast table that reports changes for async data fetching
export const BroadcastsTableAsync = (props: {
  limit: number
  total: number
  page: number
  data: Studio.Broadcast[]
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
