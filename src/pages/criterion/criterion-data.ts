import { orderBy } from 'lodash'
import moment from 'moment'
import { fetchAPI } from '../../utils/fetch-api'

// Core

export const getCriterionStatistics = async (numDays: number | null) => {
  let previousDateRange: DateRange = null
  let currentDateRange: DateRange = null

  if (numDays !== null) {
    previousDateRange = {
      startDate: moment(createDate(numDays * 2)).format('YYYY-MM-DD HH:mm:ss'),
      endDate: moment(createDate(numDays)).format('YYYY-MM-DD HH:mm:ss'),
    }
    currentDateRange = {
      startDate: moment(createDate(numDays)).format('YYYY-MM-DD HH:mm:ss'),
      endDate: moment(createDate()).format('YYYY-MM-DD HH:mm:ss'),
    }
  }

  const [responses, triggers, reviews, currentStats, previousStats] =
    await Promise.all([
      getResponses(),
      getTriggers(),
      getReviews(numDays),
      getStatistics(previousDateRange),
      getStatistics(currentDateRange),
    ])

  return {
    responses: orderBy(responses, ['rating'], ['asc']),
    triggers,
    reviews,
    currentStats,
    previousStats,
  } as CriterionData
}

// Helpers

const createDate = (offset = 0) => {
  let temp_date = new Date()
  return temp_date.setDate(temp_date.getDate() - offset)
}

// API

export const getResponses = async () =>
  fetchAPI(`/api/criterion/responses`) ?? []

export const getTriggers = async () => fetchAPI(`/api/criterion/triggers`) ?? []

export const getReviews = async (numDays = 0) => {
  const date = moment(createDate(numDays)).format('YYYY-MM-DD HH:mm:ss')
  return fetchAPI(`/api/criterion/reviews?page=0&limit=24&date=${date}`) ?? []
}

export const getStatistics = async (dateRange?: DateRange) =>
  dateRange
    ? fetchAPI(
        `/api/criterion/statistics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
      ) ?? []
    : fetchAPI(`/api/criterion/statistics`) ?? []

// Types

export type CriterionData = {
  responses: Response[]
  triggers: Trigger[]
  reviews: Review[]
  currentStats: CriterionStatistics
  previousStats: CriterionStatistics
}

type DateRange = {
  startDate: string
  endDate: string
}

export type Attempt = {
  id: string
  user_id: string
  reviewed: boolean
  timestamp: string
  product: string
  platform: string
  formattedTimestamp: string
}

export type Response = {
  id: string
  rating: number
  message: string
  timestamp: string
  formattedTimestamp: string
  deleted: boolean
}

export type Trigger = {
  id: string
  triggerProperty: string
  triggerValue: number
  timestamp: string
  product: string
  formattedTimestamp: string
  deleted: boolean
  description: string
  target: string
  type: string
}

export type Review = {
  id: string
  userId: string
  rating: number
  comment: string
  platform: string
  product: string
  timestamp: string
  formattedTimestamp: string
  deleted: boolean
}

type RatingProportion = {
  percent: number
  count: number
}

export type CriterionStatistics = {
  nps_score: number
  nps_mean_score: number
  nps_groups: {
    promoters: RatingProportion
    passives: RatingProportion
    detractors: RatingProportion
  }
  rating_groups: {
    zero: RatingProportion
    one: RatingProportion
    two: RatingProportion
    three: RatingProportion
    four: RatingProportion
    five: RatingProportion
    six: RatingProportion
    seven: RatingProportion
    eight: RatingProportion
    nine: RatingProportion
    ten: RatingProportion
  }
  response_rate: number
  review_count: number
}
