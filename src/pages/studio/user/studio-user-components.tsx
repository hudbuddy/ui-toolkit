import React from 'react'
import { Box, Row, createBox, wrapBox } from '../../../ui/Layout'
import * as Color from '../../../ui/colors'
import { FaIcon, Icon } from '../../../ui/icons/Icon'
import type * as Studio from '../studio-types'

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
        link={`${baseUrl}/d/customers/${customerId}`}
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

export const RoleBadge = wrapBox(({ role }: { role: string }) => {
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
  fontSize: 44,
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

export const ListButton = wrapBox(
  ({
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
          fontSize: 14,
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
  },
)
