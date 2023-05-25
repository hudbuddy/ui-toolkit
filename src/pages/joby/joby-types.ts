export enum AuthDestinations {
  Facebook = 'facebook',
  Twitch = 'twitchtv',
  YouTube = 'youtube',
}
export enum ManualDestinations {
  Amazon = 'amazon',
  CustomRTMP = 'custom',
  DLive = 'dlive',
  Douyu = 'douyu',
  Huya = 'huya',
  Instagram = 'instagram',
  LinkedIn = 'linkedin',
  TikTok = 'tiktok',
  Trovo = 'trovo',
  Twitter = 'twitter',
  Vimeo = 'vimeo',
  Wowza = 'wowza',
  YouTubeManual = 'youtube-manual',
}

export type AuthDestinationType = AuthDestinations
export type ManualDestinationType = ManualDestinations
export type DestinationType = AuthDestinationType | ManualDestinationType

export type Destination = {
  address: any
  collectionId: string
  destinationId: string
  enabled: boolean
  metadata: {
    props: {
      accessToken?: string
      auth: boolean
      dashboardUrl?: string
      logo?: string
      providerId?: string
      refreshToken?: string
      settings?: any
      type: DestinationType
      username?: string
    }
  }
  projectId: string
  timeout: number
}

export type Project = {
  collectionId: string
  projectId: string
  metadata: {
    layoutId: string
    [key: string]: any
  }
  rendering: {
    video: {
      colorSpace: string
      framerate: number
      height: number
      width: number
    }
    audio: {
      channelAudio: string
    }
    quality: string
    complexity: number
  }
  encoding: {
    audio: any
    video: any
  }
  sources: any[]
  destinations: Destination[]
  composition: {
    studioSdk: {
      version: string
    }
    scene: {
      debug: boolean
    }
  }
  maxDuration?: number
  webrtc: {
    hosted: {
      enabled: boolean
    }
  }
  triggers: any[]
  location: {
    latitude: number
    longitude: number
  }
  guestCodes: Array<{
    autoDelete: Date
    code: string
    collectionId: string
    projectId: string
    url: string
  }>
  [key: string]: any
}


export const enum SubscriptionStatus {
  Active = 'active',
  Cancelled = 'cancelled',
  NonRenewing = 'non_renewing',
  InTrial = 'in_trial',
}

export type SubscriptionItem = {
  item_price_id: string
  item_plan: string
}

export type User = {
  id: string
  createdAt: Date
  deleted: boolean
  email: string
  externalAuthId: string
  entitlements: Array<{
    subscription_id: string
    feature_id: string
    feature_name: string
    value: string | number | boolean
    is_enabled: boolean
  }>
  lastLoggedInAt: Date
  subscriptions: Array<{
    id: string
    /** Timestamp In seconds */
    nextBillingAt: number
    status: SubscriptionStatus
    subscription_items: Array<SubscriptionItem>
    synchedAt: Date
    scheduledChanges: Array<{
      changes_scheduled_at: Date
      subscription_items?: Array<SubscriptionItem>
      status?: SubscriptionStatus
    }>
  }>
  updatedAt: Date
  __v?: number
}
