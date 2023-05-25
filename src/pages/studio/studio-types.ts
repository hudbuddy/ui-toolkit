export type User = {
  id: string
  displayName: string
  email: string
  createdAtRaw: string
  createdAt: string
  deleted: boolean
  roles: string[]
  availableRoles: string[]
  subscription: Subscription
  hasAcceptedDataPolicy: boolean
  activeProjectId: string
  accounts: Account[]
  projects: Project[]
  clients: any[]
  broadcasts: Broadcasts
}

export type Subscription = {
  cost: string
  subscriptionId: string
  status: string
  lastTransactionStatus: string
  planId: string
  nextBillingDate: string
  braintreeCustomerId: string
  customerId: string
  lastBilledAtDate: string
  firstSubscribedAt: string
  trialEnds: string
  initialPlanCost: any
}

export type Account = {
  id: string
  deleted: boolean
  type: Platform
  email?: string
  username?: string
  active: boolean
  createdAt: string
  updatedAt: string
  owner: string
  providerId: string
  rawJSON: any
}

export type Project = {
  id: string
  bitrate?: string
  deleted: boolean
  width: number
  height: number
  createdAt: string
  profile: string
  scenes: Scene[]
  type: string
  owner: string
  isAutoLive: boolean
  mode: string
  isQuickSceneSwitchEnabled: boolean
  isDisconnectProtectionEnabled: boolean
  resources: any[]
  title?: string
}

export type Scene = {
  id: string
  title?: string
  deleted: boolean
  createdAt: string
  updatedAt: string
  assets: any[]
  owner: string
  snapshotUrl: string
}

export type Broadcasts = {
  count: string
  list: Broadcast[]
}

export type Broadcast = {
  broadcastId: string
  title: string
  length: string
  rawLength: number
  startDate: string
  rawStartDate: string
  userId: string
  failed: boolean
  aborted?: boolean
  canceled: boolean
  projectType: string
  platform: Platform
  region: string
  origin: string
  iconClass: string
  shortUser: string
  shortTitle: string
  user: string
  projectId: string
  service: string
  sessionId: string
  createDetails: {
    cause?: string
    origin?: string
    region?: string
  }
  stopDetails: {
    cause?: string
    origin?: string
    reason: any
  }
  rawData: any
}

export type BroadcastDurationData = {
  week: string
  mixer_broadcast_count: string
  facebook_broadcast_count: string
  youtube_broadcast_count: string
  twitchtv_broadcast_count: string
  rtmp_broadcast_count: string
  hitbox_broadcast_count: string
  local_broadcast_count: string
  mixer_project_count: string
  default_project_count: string
  total_time: string
  failed_count: string
  aborted_count: string
  total_count: string
  success_percentage: string
  longest_broadcast: string
}

export enum Platform {
  Facebook = 'facebook',
  Twitch = 'twitchtv',
  YouTube = 'youtube',
  Magic = 'magic',
  CustomRTMP = 'rtmp',
}
