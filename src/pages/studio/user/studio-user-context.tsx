import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { fetchAPI } from '../../../utils/fetch-api'
import type * as Studio from '../studio-types'
import moment from 'moment'
import { UserBroadcastChartData } from './studio-user-charts'
import { Attempt, Review } from '../../criterion/criterion-data'
import {
  BroadcastsProvider,
  useBroadcasts,
} from '../broadcasts/broadcasts-page'

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
  updateCurrentUser: (props: Partial<CurrentUser>) => CurrentUser
  // Matches the ID of the latest call to fetchUser(id)
  currentUserId: string
  isFetchingId: string | null
}

export type CurrentUser = Studio.User & {
  status: UserStatus
  criterion: UserCriterion
  broadcastChartData: { labels: string[]; data: UserBroadcastChartData[] }
  setRoles: (roles: string[]) => Promise<void>
  deleteProject: (project: Studio.Project) => Promise<void>
  deleteScene: (scene: Studio.Scene) => Promise<void>
  deleteAsset: (asset: Studio.Asset) => Promise<void>
  deleteAccount: (account: Studio.Account) => Promise<void>
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

const StudioUserProviderBody = ({ children }: { children: ReactNode }) => {
  const { broadcasts } = useBroadcasts()
  const [currentUserId, setCurrentUserId] = useState<string>(null)
  const [isFetchingId, setIsFetchingId] = useState<string>(null)
  const [users, setUsers] = useState<StudioUserMap>({})

  const fetchUser = useCallback(
    async (id: string) => {
      setIsFetchingId(id)
      setCurrentUserId(id)
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

  const updateCurrentUser = useCallback(
    (props: Partial<CurrentUser>) => {
      if (!users[currentUserId]) return
      const user = {
        ...users[currentUserId],
        ...props,
      }
      setUsers({
        ...users,
        [currentUserId]: user,
      })
      return user
    },
    [users, currentUserId],
  )

  useEffect(() => {
    // Update current user once broadcast data is available
    const user = users[currentUserId]
    if (!user) return

    const liveBroadcast = broadcasts.find((x) => x.userId === currentUserId)
    const isLive = Boolean(liveBroadcast)
    const gameSourceUrl =
      liveBroadcast?.projectType === 'mixer'
        ? `https://studio.golightstream.com/webpack/webrtc.html?peerId=game-source&roomId=${liveBroadcast.projectId}`
        : null

    updateCurrentUser({
      status: {
        ...user.status,
        liveBroadcast,
        isLive,
        gameSourceUrl,
      },
    })
  }, [users[currentUserId]?.id, currentUserId, broadcasts.length])

  return (
    <StudioUserContext.Provider
      value={{
        users,
        fetchUser,
        updateCurrentUser,
        currentUserId,
        isFetchingId,
      }}
    >
      {children}
    </StudioUserContext.Provider>
  )
}

export const StudioUserProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <BroadcastsProvider>
      <StudioUserProviderBody>{children}</StudioUserProviderBody>
    </BroadcastsProvider>
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
  return fetchAPI(`/api/criterion/reviews?userId=${id}`, {}, [])
}

const fetchAttempts = (id: string) => {
  return fetchAPI(`/api/criterion/attempts?userId=${id}`, {}, [])
}

export const getUserWithStatus = async (id: string) => {
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

  const status = {
    timeBroadcastedHours: 0,
    broadcastsTotal: 0,
    longestBroadcast: 0,
    totalFailedBroadcasts: 0,
    totalAbortedBroadcasts: 0,
    isLive: false,
    liveBroadcast: null,
    gameSourceUrl: null,
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
    roles: user.roles.filter((role) => role !== ''),
    criterion,
    broadcastChartData,
    status,
  } as CurrentUser
}

export const useStudio = () => useContext(StudioUserContext)

export const useStudioUser = (id: string) => {
  const { fetchUser, currentUserId, users } = useStudio()

  useEffect(() => {
    fetchUser(id)
  }, [id])

  return users[currentUserId]
}

export const useCurrentStudioUser = () => {
  const { users, currentUserId, updateCurrentUser } =
    useContext(StudioUserContext)
  const user = users[currentUserId]

  const setRoles = useCallback(
    (roles: string[]) => {
      updateCurrentUser({ roles })
      return fetchAPI(`/api/users/${user.id}/roles`, {
        method: 'POST',
        body: {
          roles,
        },
      })
    },
    [user?.id, updateCurrentUser],
  )

  const deleteAccount = useCallback(
    async (account: Studio.Account) => {
      updateCurrentUser({
        accounts: user.accounts.filter((x) => x.id !== account.id),
      })
      await fetchAPI(`/api/accounts/${account.id}`, {
        method: 'DELETE',
        body: {
          providerId: account.providerId,
        },
      })
    },
    [user?.id, updateCurrentUser],
  )

  const deleteProject = useCallback(
    async (project: Studio.Project) => {
      updateCurrentUser({
        projects: user.projects.filter((x) => x.id !== project.id),
      })
      await fetchAPI(`/api/projects/${project.id}`, {
        method: 'DELETE',
        body: {
          owner: project.owner,
        },
      })
    },
    [user?.id, updateCurrentUser],
  )

  const deleteScene = useCallback(
    async (scene: Studio.Scene) => {
      const projects = user.projects.map((project) => {
        return project.id === scene.owner
          ? {
              ...project,
              scenes: project.scenes.filter((x) => x.id !== scene.id),
            }
          : project
      })
      updateCurrentUser({
        projects,
      })
      await fetchAPI(`/api/scenes/${scene.id}`, {
        method: 'DELETE',
        body: {
          owner: scene.owner,
        },
      })
    },
    [user?.id, updateCurrentUser],
  )

  const deleteAsset = useCallback(
    async (asset: Studio.Asset) => {
      const projects = user.projects.map((project) => {
        return {
          ...project,
          scenes: project.scenes.map((scene) => {
            return scene.id === asset.owner
              ? {
                  ...scene,
                  assets: scene.assets.filter((x) => x.id !== asset.id),
                }
              : scene
          }),
        }
      })
      updateCurrentUser({
        projects,
      })
      await fetchAPI(`/api/assets/${asset.id}`, {
        method: 'DELETE',
        body: {
          owner: asset.owner,
        },
      })
    },
    [user?.id, updateCurrentUser],
  )

  return user
    ? {
        ...user,
        setRoles,
        deleteProject,
        deleteScene,
        deleteAsset,
        deleteAccount,
      }
    : null
}
