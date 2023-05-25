import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'
import { fetchAPI } from '../../../utils/fetch-api'
import type * as Studio from '../studio-types'
import moment from 'moment'
import { UserBroadcastChartData } from './studio-user-charts'
import { Attempt, Review } from '../../criterion/criterion-data'

/**
 * TODO: Extend this generically as "useStudio" if it makes sense
 */

type StudioUserMap = {
  [id: string]: CurrentUser
}

const StudioUserContext = createContext<StudioUserState>({} as StudioUserState)
type StudioUserState = {
  users: StudioUserMap
  fetchUser: (id: string) => Promise<CurrentUser>
  // Matches the ID of the latest call to fetchUser(id)
  currentUserId: string
  isFetchingId: string | null
}

type CurrentUser = Studio.User & {
  status: UserStatus
  criterion: UserCriterion
  broadcastChartData: { labels: string[]; data: UserBroadcastChartData[] }
}

type UserStatus = {
  timeBroadcastedFormatted: {
    hours: number
    minutes: number
  }
  timeBroadcastedHours: number
  broadcastsTotal: number
  longestBroadcast: number
  totalFailedBroadcasts: number
  totalAbortedBroadcasts: number
  successPercentage: number
  successPercentageFormatted: string
  liveBroadcast: Studio.Broadcast | null
  isLive: boolean
  flaggedBroadcastCount: number
  gameSourceUrl: string | null
}

type UserCriterion = {
  averageRating: number | string
  reviews: Review[]
  attempts: Attempt[]
}

export const StudioUserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUserId, setCurrentUserId] = useState<string>(null)
  const [isFetchingId, setIsFetchingId] = useState<string>(null)
  const [users, setUsers] = useState<StudioUserMap>({})

  const fetchUser = useCallback(
    async (id: string) => {
      setCurrentUserId(id)
      setIsFetchingId(id)
      try {
        const user = await getUserWithStatus(id)
        setUsers({
          ...users,
          [user.id]: user,
        })

        // @ts-ignore
        window.user = user
        return user
      } catch (e) {}
      setIsFetchingId(null)
      return null
    },
    [users],
  )

  return (
    <StudioUserContext.Provider
      value={{
        users,
        fetchUser,
        currentUserId,
        isFetchingId,
      }}
    >
      {children}
    </StudioUserContext.Provider>
  )
}

const fetchUser = (id: string): Promise<Studio.User> => {
  return fetchAPI(`/api/users/${id}`, {
    method: 'POST',
    body: {
      productFilter: 'studio',
      // TODO: Pagination
      broadcasts: {
        page: 0,
        limit: 20,
      },
    },
  })
}

const fetchReviews = (id: string) => {
  // return fetchAPI(`/api/criterion/reviews?userId=${id}`)
  return [
    {
      id: '24382',
      userId: '64160a6d68cc572f43a33a23',
      rating: 10,
      comment: '',
      platform: 'magic',
      product: 'studio',
      timestamp: '2023-04-19T09:01:17.227Z',
      formattedTimestamp: 'Apr 19 2023',
      deleted: false,
    },
  ]
}

const fetchAttempts = (id: string) => {
  // return fetchAPI(`/api/criterion/attempts?userId=${id}`)
  return [
    {
      id: '335309',
      user_id: '64160a6d68cc572f43a33a23',
      reviewed: false,
      timestamp: '2023-03-27T20:13:53.000Z',
      product: 'studio',
      platform: 'twitchtv',
      formattedTimestamp: 'Mar 27 2023',
    },
    {
      id: '338136',
      user_id: '64160a6d68cc572f43a33a23',
      reviewed: true,
      timestamp: '2023-04-19T09:01:17.282Z',
      product: 'studio',
      platform: 'magic',
      formattedTimestamp: 'Apr 19 2023',
    },
    {
      id: '338137',
      user_id: '64160a6d68cc572f43a33a23',
      reviewed: true,
      timestamp: '2023-04-19T09:01:19.522Z',
      product: 'studio',
      platform: 'magic',
      formattedTimestamp: 'Apr 19 2023',
    },
  ]
}

const getUserWithStatus = async (id: string) => {
  const user = await fetchUser(id)
  const [criterionReviews, criterionAttempts, broadcastStats] =
    await Promise.all([
      fetchReviews(id),
      fetchAttempts(id),
      fetchAPI('/api/broadcasts/stats', {
        method: 'POST',
        body: {
          userId: id,
          userCreatedAt: moment(user.createdAtRaw).format(
            'YYYY-MM-DD HH:mm:ss',
          ),
        },
      }),
    ])

  const criterion = {
    reviews: criterionReviews,
    averageRating:
      criterionReviews.length === 0 ? '-' : criterionReviews[0].rating,
    attempts: criterionAttempts,
  } as UserCriterion

  // TODO: Get live broadcast
  //  broadcasts.live.find(x => user.id === x.userId)
  const liveBroadcast = null
  const isLive = Boolean(liveBroadcast)

  // TODO: Get flagged
  //  Boolean(broadcasts.flagged.filter(x => user.id === x.userId))
  const flaggedBroadcastCount = 0

  const gameSourceUrl =
    liveBroadcast?.projectType === 'mixer'
      ? `https://studio.golightstream.com/webpack/webrtc.html?peerId=game-source&roomId=${liveBroadcast.projectId}`
      : null

  const status = {
    timeBroadcastedHours: 0,
    broadcastsTotal: 0,
    longestBroadcast: 0,
    totalFailedBroadcasts: 0,
    totalAbortedBroadcasts: 0,
    flaggedBroadcastCount,
    isLive,
    liveBroadcast,
    gameSourceUrl,
  } as UserStatus

  const broadcastChartData = {
    labels: [],
    data: [],
  }

  broadcastStats.forEach((segment) => {
    const totalBroadcasts = parseInt(segment.total_count)
    const successPercentage = parseFloat(segment.success_percentage) / 100

    broadcastChartData.labels.push(segment.week)
    broadcastChartData.data.push({
      timeBroadcastedHours: parseFloat(segment.total_time),
      totalBroadcasts,
      successfulBroadcasts: Math.round(totalBroadcasts * successPercentage),
      failedBroadcasts: Math.round(
        totalBroadcasts - totalBroadcasts * successPercentage,
      ),
      successPercentage,
      successPercentageFormatted:
        parseInt(segment.total_count) > 0 ? successPercentage.toFixed(2) : '-',
      longestBroadcast: `${Math.floor(
        Number(segment.longest_broadcast),
      )}h ${Math.floor((Number(segment.longest_broadcast) % 1) * 60)}m`,
    })
    status.timeBroadcastedHours += parseFloat(segment.total_time)
    status.broadcastsTotal += parseInt(segment.total_count)
    status.longestBroadcast =
      parseFloat(segment.longest_broadcast) > status.longestBroadcast
        ? parseFloat(segment.longest_broadcast)
        : status.longestBroadcast
    status.totalFailedBroadcasts += parseInt(segment.failed_count)
    status.totalAbortedBroadcasts += parseInt(segment.aborted_count)
  })

  status.timeBroadcastedFormatted = {
    hours: Math.floor(status.timeBroadcastedHours),
    minutes: Math.floor((status.timeBroadcastedHours % 1) * 60),
  }
  status.successPercentage =
    100 -
    (100 * (status.totalFailedBroadcasts + status.totalAbortedBroadcasts)) /
      status.broadcastsTotal
  status.successPercentageFormatted =
    status.broadcastsTotal > 0 ? status.successPercentage.toFixed(2) : '-'

  return {
    ...user,
    criterion,
    broadcastChartData,
    status,
  } as CurrentUser
}

export const useStudio = () => useContext(StudioUserContext)

export const useCurrentStudioUser = () => {
  const { users, currentUserId } = useContext(StudioUserContext)
  return users[currentUserId]
}
