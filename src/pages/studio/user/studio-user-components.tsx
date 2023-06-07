import { startCase } from 'lodash'
import moment from 'moment'
import React from 'react'
import { IconButton, Label, TextItem } from '../../../ui'
import { Box, Column, Row, createBox, wrapBox } from '../../../ui/Layout'
import * as Color from '../../../ui/colors'
import { FaIcon, Icon } from '../../../ui/icons/Icon'
import { formatTimestamp } from '../../../utils/date-formatter'
import { copyToClipboard } from '../../../utils/helpers'
import type * as Studio from '../studio-types'
import { CurrentUser } from './studio-user-context'

export const DataPolicyIcon = wrapBox(({ accepted }: { accepted: boolean }) => {
  return (
    <Box
      tooltip={`Data Policy ${accepted ? 'Accepted' : 'Not Accepted'}`}
      style={{
        height: 15,
        width: 15,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '50% 50%',
        backgroundImage: accepted
          ? 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgwIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDUwLjUgODMuN2wtMTkyLTgwYTQ4LjE1IDQ4LjE1IDAgMDAtMzYuOSAwbC0xOTIgODBDMTEuNyA5MS4xIDAgMTA4LjYgMCAxMjhjMCAxOTguNSAxMTQuNSAzMzUuNyAyMjEuNSAzODAuMyAxMS44IDQuOSAyNS4xIDQuOSAzNi45IDBDMzQ0LjEgNDcyLjYgNDgwIDM0OS4zIDQ4MCAxMjhjMC0xOS40LTExLjctMzYuOS0yOS41LTQ0LjN6bS00Ny4yIDExNC4ybC0xODQgMTg0Yy02LjIgNi4yLTE2LjQgNi4yLTIyLjYgMGwtMTA0LTEwNGMtNi4yLTYuMi02LjItMTYuNCAwLTIyLjZsMjIuNi0yMi42YzYuMi02LjIgMTYuNC02LjIgMjIuNiAwbDcwLjEgNzAuMSAxNTAuMS0xNTAuMWM2LjItNi4yIDE2LjQtNi4yIDIyLjYgMGwyMi42IDIyLjZjNi4zIDYuMyA2LjMgMTYuNCAwIDIyLjZ6IiBmaWxsPSIjMjZBRDgwIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L3N2Zz4=)'
          : 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgwIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDUwLjUgODMuN2MxNy44IDcuNCAyOS41IDI0LjkgMjkuNSA0NC4zIDAgMjIxLjMtMTM1LjkgMzQ0LjYtMjIxLjYgMzgwLjNhNDguMTUgNDguMTUgMCAwMS0zNi45IDBDMTE0LjUgNDYzLjcgMCAzMjYuNSAwIDEyOGMwLTE5LjQgMTEuNy0zNi45IDI5LjYtNDQuM2wxOTItODBhNDguMTUgNDguMTUgMCAwMTM2LjkgMGwxOTIgODB6TTI3Ny40MDQgMjU2bDg1LjMwNi04NS4zMDZjNC45MzQtNC45MzQgNC45MzQtMTIuOTQgMC0xNy44ODJsLTE5LjgyMi0xOS44MjJjLTQuOTM0LTQuOTMzLTEyLjk0LTQuOTMzLTE3Ljg4MiAwbC04NS4yOTggODUuMzE0LTg1LjMwNi04NS4zMDZjLTQuOTM0LTQuOTM0LTEyLjk0LTQuOTM0LTE3Ljg4MiAwbC0xOS44MTQgMTkuODE0Yy00LjkzMyA0LjkzNC00LjkzMyAxMi45NCAwIDE3Ljg4MkwyMDIuMDEyIDI1NmwtODUuMzA2IDg1LjMwNmMtNC45MzMgNC45MzQtNC45MzMgMTIuOTQgMCAxNy44ODJsMTkuODIyIDE5LjgyMmM0LjkzNCA0LjkzMyAxMi45NCA0LjkzMyAxNy44ODIgMGw4NS4yOTgtODUuMzE0IDg1LjMwNiA4NS4zMDZjNC45MzQgNC45MzQgMTIuOTQgNC45MzQgMTcuODgyIDBsMTkuODIyLTE5LjgyMmM0LjkzNC00LjkzNCA0LjkzNC0xMi45NCAwLTE3Ljg4MkwyNzcuNDA0IDI1NnoiIGZpbGw9IiNFOTU1NEEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjwvc3ZnPg==)',
      }}
    />
  )
})

export const ChargebeeIcon = wrapBox(
  ({ customerId, baseUrl }: { customerId: string; baseUrl: string }) => {
    return (
      <Box
        tooltip="Chargebee URL"
        href={`${baseUrl}/d/customers/${customerId}`}
        target="_blank"
        style={{
          color: '#ccc',
          border: '1px solid #ccc',
          borderRadius: '50%',
          padding: 3,
        }}
        hover={{
          cursor: 'pointer',
          color: 'white',
          border: '1px solid white',
        }}
      >
        <Icon name="Chargebee" height={12} width={12} />
      </Box>
    )
  },
)

export const getRoleForUser = (user: Studio.User) => {
  const roles = user.roles.map((r) => r.toLowerCase())
  if (roles.includes('vip')) {
    return 'vip'
  }
  if (!user.subscription || user.subscription.status === 'cancelled') {
    return 'inactive'
  }
  const planPrefix = user.subscription?.planId.split('_')[0]
  if (planPrefix === 'mixer') {
    return 'gamer'
  }
  return 'creator'
}

const colorForRole = {
  inactive: '#333',
  gamer: Color.twitch.toString(),
  creator: Color.lightstream.toString(),
  vip: '#FBD656',
  premium: Color.green.light,
}

export const SubscriptionBadge = wrapBox(({ role }: { role: string }) => {
  return (
    <Box
      paddingLeft={8}
      paddingRight={8}
      paddingTop={3}
      paddingBottom={3}
      alignItems="center"
      justifyContent="center"
      style={{
        fontSize: 10,
        fontWeight: 600,
        border: `1px solid ${colorForRole[role]}`,
        borderRadius: '30px',
        color: colorForRole[role],
      }}
    >
      {role.toUpperCase()}
    </Box>
  )
})

export const RoleBadge = wrapBox(
  ({
    role,
    onRemove,
    canRemove = false,
  }: {
    role: string
    onRemove?: () => void
    canRemove?: boolean
  }) => {
    return (
      <Row
        paddingLeft={8}
        paddingRight={8}
        height={17}
        alignItems="center"
        justifyContent="center"
        style={{
          fontSize: 10,
          fontWeight: 600,
          background: Color.neutral(700),
          borderRadius: '30px',
          color: 'white',
        }}
      >
        {startCase(role)}
        {canRemove && (
          <IconButton
            size={14}
            marginLeft={4}
            icon="Close"
            colorWeight={300}
            onClick={onRemove}
          />
        )}
      </Row>
    )
  },
)

export const DetailLabel = createBox({
  color: 'rgba(255,255,255,60%)',
  fontSize: 12,
})

export const DetailSpacer = () => (
  <Box marginLeft={8} marginRight={8} opacity={0.7}>
    |
  </Box>
)

export const OverviewLabel = createBox({
  opacity: 0.7,
  textTransform: 'uppercase',
  fontSize: 13,
  marginBottom: 8,
})

export const OverviewNumber = createBox({
  fontSize: 38,
})

export const OverviewSuffix = createBox({
  fontSize: 24,
  opacity: 0.7,
})

export const OverviewMetric = wrapBox(
  ({ suffix, children }: { suffix?: string; children: React.ReactNode }) => {
    return (
      <OverviewNumber alignItems="baseline">
        {children}
        <OverviewSuffix>{suffix}</OverviewSuffix>
      </OverviewNumber>
    )
  },
)

export const Disabled = ({ children }: { children: React.ReactNode }) => {
  return (
    <Row
      style={{ cursor: 'not-allowed', opacity: 0.5 }}
      width="100%"
      tooltip="Currently unavailable"
    >
      <Row
        width="100%"
        style={{
          pointerEvents: 'none',
        }}
      >
        {children}
      </Row>
    </Row>
  )
}

export const ListButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: React.MouseEventHandler
}) => {
  return (
    <Row
      width="100%"
      justifyContent="space-between"
      style={{
        fontSize: 13,
        opacity: 0.7,
        cursor: 'pointer',
      }}
      hover={{
        opacity: 1,
      }}
      onClick={onClick}
    >
      {children}
      <FaIcon size={20} name="faChevronRight" />
    </Row>
  )
}

export const getNpsColor = (rating?: number) => {
  if (!rating) return Color.neutral(500)
  if (rating < 7) return Color.red.dark
  if (rating < 9) return Color.yellow.dark
  return Color.lightstream.toString()
}

export const CriterionReviewHistory = ({ user }: { user: CurrentUser }) => {
  const { criterion, createdAtRaw } = user

  const sortedReviews = [...criterion.reviews].sort(
    (a, b) =>
      new Date(a.timestamp).getMilliseconds() -
      new Date(b.timestamp).getMilliseconds(),
  )
  const sortedAttempts = [...criterion.attempts].sort(
    (a, b) =>
      new Date(a.timestamp).getMilliseconds() -
      new Date(b.timestamp).getMilliseconds(),
  )

  const compositeReviews = sortedAttempts.map((x) => ({
    attempt: x,
    review: x.reviewed ? sortedReviews.shift() : null,
  }))

  if (compositeReviews.length === 0) {
    return <TextItem text="No review history" muted={true} />
  }

  return (
    <Column gap={10}>
      {compositeReviews.map(({ attempt, review }) => {
        const { localTime, utcTime } = formatTimestamp(attempt.timestamp)
        const dateDiff = moment(attempt.timestamp).diff(
          moment(createdAtRaw),
          'days',
        )

        return (
          <Column
            key={attempt.id}
            gap={2}
            padding={8}
            style={{
              borderBottom: `1px solid rgba(255,255,255,0.3)`,
            }}
          >
            <Row gap={8} marginBottom={6}>
              <Box tooltip="Copy attempt date">
                <IconButton
                  size={20}
                  icon="faCalendarAlt"
                  onClick={() => copyToClipboard(utcTime)}
                />
              </Box>
              <Box tooltip={utcTime}>{localTime}</Box>
            </Row>
            <Row gap={8} height={20}>
              <Label text="Product" width={120} />
              <TextItem text={attempt.product} />
            </Row>
            <Row gap={8} height={20}>
              <Label text="Account Age" width={120} />
              <Box tooltip="Age at time of attempt">{dateDiff + ' days'}</Box>
            </Row>
            {review && (
              <Row gap={12} marginTop={6} padding={8}>
                <Box
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                  style={{
                    borderRadius: '50%',
                    background: getNpsColor(review.rating),
                    height: 24,
                    width: 24,
                  }}
                >
                  <TextItem text={review.rating} fontSize={16} />
                </Box>
                {review.comment && <TextItem text={review.comment} />}
                {!review.comment && <TextItem text="No comment" muted={true} />}
              </Row>
            )}
            {!review && (
              <Row padding={8}>
                <TextItem
                  text="No review submitted"
                  textTransform="uppercase"
                  opacity={0.5}
                  marginTop={6}
                />
              </Row>
            )}
          </Column>
        )
      })}
    </Column>
  )
}
