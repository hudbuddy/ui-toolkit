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
      getReviews(),
      getPreviousStatistics(previousDateRange),
      getCurrentStatistics(currentDateRange),
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

// TODO: Actual requests

// '/api/criterion/responses'
export const getResponses = async () => MOCK.responses

// '/api/criterion/triggers'
export const getTriggers = async () => MOCK.triggers

// '/api/criterion/reviews?page=0&limit=24&date=<>'
export const getReviews = async () => MOCK.reviews

export const getPreviousStatistics = async (dateRange?: DateRange) =>
  dateRange
    ? MOCK.previousStatistics // '/api/criterion/statistics?startDate=${}&endDate=${}'
    : MOCK.previousStatistics // '/api/criterion/statistics'

export const getCurrentStatistics = async (dateRange?: DateRange) =>
  dateRange
    ? MOCK.currentStatistics // '/api/criterion/statistics?startDate=${}&endDate=${}'
    : MOCK.currentStatistics // '/api/criterion/statistics'


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

/**
 * TODO: REMOVE MOCK DATA
 */

const MOCK = {
  responses: [
    {
      id: '5',
      rating: 3,
      message: "I'm sorry to hear that. Care to tell us why?",
      timestamp: '2018-12-12T23:12:59.383Z',
      formattedTimestamp: 'Dec 12 2018',
      deleted: false,
    },
    {
      id: '6',
      rating: 4,
      message: "I'm sorry to hear that. Care to tell us why?",
      timestamp: '2018-12-12T23:14:15.498Z',
      formattedTimestamp: 'Dec 12 2018',
      deleted: false,
    },
    {
      id: '1',
      rating: 5,
      message: "I'm sorry to hear that. Care to tell us why?",
      timestamp: '2018-12-12T18:40:44.964Z',
      formattedTimestamp: 'Dec 12 2018',
      deleted: false,
    },
    {
      id: '11',
      rating: 10,
      message: 'Thank you! Care to tell us why?',
      timestamp: '2018-12-20T21:31:41.465Z',
      formattedTimestamp: 'Dec 20 2018',
      deleted: false,
    },
    {
      id: '10',
      rating: 9,
      message: 'Thank you! Care to tell us why?',
      timestamp: '2018-12-20T21:31:41.465Z',
      formattedTimestamp: 'Dec 20 2018',
      deleted: false,
    },
    {
      id: '9',
      rating: 8,
      message: 'Thank you! How can we improve for the future?',
      timestamp: '2018-12-20T21:31:41.465Z',
      formattedTimestamp: 'Dec 20 2018',
      deleted: false,
    },
    {
      id: '8',
      rating: 7,
      message: 'Thank you! How can we improve for the future?',
      timestamp: '2018-12-20T21:31:41.465Z',
      formattedTimestamp: 'Dec 20 2018',
      deleted: false,
    },
    {
      id: '7',
      rating: 6,
      message: "I'm sorry to hear that. Care to tell us why?",
      timestamp: '2018-12-20T21:31:41.465Z',
      formattedTimestamp: 'Dec 20 2018',
      deleted: false,
    },
    {
      id: '3',
      rating: 1,
      message: "I'm sorry to hear that. Care to tell us why?",
      timestamp: '2018-12-12T18:43:19.776Z',
      formattedTimestamp: 'Dec 12 2018',
      deleted: false,
    },
    {
      id: '4',
      rating: 2,
      message: "I'm sorry to hear that. Care to tell us why?",
      timestamp: '2018-12-12T22:29:03.816Z',
      formattedTimestamp: 'Dec 12 2018',
      deleted: false,
    },
    {
      id: '2',
      rating: 0,
      message: "I'm sorry to hear that. Care to tell us why?",
      timestamp: '2018-12-12T18:43:18.155Z',
      formattedTimestamp: 'Dec 12 2018',
      deleted: false,
    },
  ],
  triggers: [
    {
      id: '7',
      triggerProperty: 'declinedReviewRetry',
      triggerValue: 21,
      timestamp: '2019-03-01T20:01:03.780Z',
      product: 'studio',
      formattedTimestamp: 'Mar 1 2019',
      deleted: false,
      description:
        'If the user had previously declined to review, try again in 21 days',
      target: 'new_user',
      type: 'date',
    },
    {
      id: '8',
      triggerProperty: 'reviewFollowUp',
      triggerValue: 180,
      timestamp: '2019-03-01T20:06:12.287Z',
      product: 'studio',
      formattedTimestamp: 'Mar 1 2019',
      deleted: false,
      description:
        'If the user had previously given a review, follow up with them in 180 days to see if their opinion has changed.',
      target: 'returning_user',
      type: 'date',
    },
    {
      id: '1',
      triggerProperty: 'createdAt',
      triggerValue: 3,
      timestamp: '2022-11-11T17:03:00.000Z',
      product: 'studio',
      formattedTimestamp: 'Nov 11 2022',
      deleted: false,
      description:
        'Prompt if the user has had an account for more than N (trigger value) days.',
      target: 'new_user',
      type: 'date',
    },
  ],
  reviews: [
    {
      id: '24646',
      userId: '6459a1a897b9bc8706d24501',
      rating: 10,
      comment: '',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-11T02:25:28.922Z',
      formattedTimestamp: 'May 11 2023',
      deleted: false,
    },
    {
      id: '24645',
      userId: '603e5bc151ff0167b37ba520',
      rating: 10,
      comment: '',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-11T00:23:29.634Z',
      formattedTimestamp: 'May 11 2023',
      deleted: false,
    },
    {
      id: '24644',
      userId: '61a76c3fb80660782319f2cf',
      rating: 10,
      comment: '',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-10T22:16:42.838Z',
      formattedTimestamp: 'May 10 2023',
      deleted: false,
    },
    {
      id: '24643',
      userId: '6229446b2ad40259d601e9ce',
      rating: 10,
      comment: '',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-10T21:32:18.478Z',
      formattedTimestamp: 'May 10 2023',
      deleted: false,
    },
    {
      id: '24642',
      userId: '644f2aa9669838b1a793ca0b',
      rating: 9,
      comment: '',
      platform: 'youtube',
      product: 'studio',
      timestamp: '2023-05-10T20:14:39.154Z',
      formattedTimestamp: 'May 10 2023',
      deleted: false,
    },
    {
      id: '24641',
      userId: '64593d8d97b9bc69ccd10fbb',
      rating: 10,
      comment: '',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-10T18:28:04.824Z',
      formattedTimestamp: 'May 10 2023',
      deleted: false,
    },
    {
      id: '24640',
      userId: '6458d0c4a66c5434c54ec0f2',
      rating: 8,
      comment: '',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-10T17:33:19.954Z',
      formattedTimestamp: 'May 10 2023',
      deleted: false,
    },
    {
      id: '24639',
      userId: '616950ba48200b03e1e8c00d',
      rating: 1,
      comment: '',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-10T12:45:47.166Z',
      formattedTimestamp: 'May 10 2023',
      deleted: false,
    },
    {
      id: '24638',
      userId: '64585b0235959357d5c26442',
      rating: 10,
      comment:
        'I am on my second day of using this service and I know I have more features to explore but so far it has turned round my console streams.',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-10T06:50:13.101Z',
      formattedTimestamp: 'May 10 2023',
      deleted: false,
    },
    {
      id: '24637',
      userId: '6454c1165c80770eb46da022',
      rating: 10,
      comment: 'more walk through details',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-10T05:16:55.872Z',
      formattedTimestamp: 'May 10 2023',
      deleted: false,
    },
    {
      id: '24636',
      userId: '641f8138f050d244dcc23eb5',
      rating: 10,
      comment: '',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-10T04:15:52.435Z',
      formattedTimestamp: 'May 10 2023',
      deleted: false,
    },
    {
      id: '24635',
      userId: '63f2fe6d5166acb4add78183',
      rating: 6,
      comment: '',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-10T01:17:52.054Z',
      formattedTimestamp: 'May 10 2023',
      deleted: false,
    },
    {
      id: '24634',
      userId: '640a575e273f66235601af95',
      rating: 9,
      comment: '',
      platform: 'magic',
      product: 'studio',
      timestamp: '2023-05-10T00:59:31.296Z',
      formattedTimestamp: 'May 10 2023',
      deleted: false,
    },
    {
      id: '24633',
      userId: '6453f281e59b99241ec5f9f8',
      rating: 1,
      comment: '',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-10T00:44:14.283Z',
      formattedTimestamp: 'May 10 2023',
      deleted: false,
    },
    {
      id: '24632',
      userId: '6456a6a39431bb1a3e4931f6',
      rating: 10,
      comment: '',
      platform: 'magic',
      product: 'studio',
      timestamp: '2023-05-10T00:31:13.365Z',
      formattedTimestamp: 'May 10 2023',
      deleted: false,
    },
    {
      id: '24631',
      userId: '6454791f7c7ad54a59c66e30',
      rating: 10,
      comment: '',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-09T22:16:05.423Z',
      formattedTimestamp: 'May 9 2023',
      deleted: false,
    },
    {
      id: '24630',
      userId: '64580511b645b590692896f3',
      rating: 9,
      comment: '',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-09T21:05:34.712Z',
      formattedTimestamp: 'May 9 2023',
      deleted: false,
    },
    {
      id: '24629',
      userId: '6457e1fe3595938095c0d6d3',
      rating: 7,
      comment: 'more options',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-09T20:19:51.380Z',
      formattedTimestamp: 'May 9 2023',
      deleted: false,
    },
    {
      id: '24628',
      userId: '6453e000e59b99253fc5cfd4',
      rating: 10,
      comment: '',
      platform: 'magic',
      product: 'studio',
      timestamp: '2023-05-09T19:52:07.717Z',
      formattedTimestamp: 'May 9 2023',
      deleted: false,
    },
    {
      id: '24627',
      userId: '6456ec4b359593d88ebf0cdb',
      rating: 6,
      comment: '',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-09T17:17:29.280Z',
      formattedTimestamp: 'May 9 2023',
      deleted: false,
    },
    {
      id: '24626',
      userId: '6453ee1d189807ac5efde1f1',
      rating: 10,
      comment: '',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-09T16:53:29.024Z',
      formattedTimestamp: 'May 9 2023',
      deleted: false,
    },
    {
      id: '24625',
      userId: '643a02aa3cb16a676a1ec1bc',
      rating: 10,
      comment: '',
      platform: 'magic',
      product: 'studio',
      timestamp: '2023-05-09T15:27:52.449Z',
      formattedTimestamp: 'May 9 2023',
      deleted: false,
    },
    {
      id: '24624',
      userId: '6431904362d680c10dd2a3e6',
      rating: 10,
      comment: 'easy to use for console streamers ',
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-04-09T11:06:11.235Z',
      formattedTimestamp: 'May 9 2023',
      deleted: false,
    },
    {
      id: '24623',
      userId: '64530e647c7ad5fe82c5fe50',
      rating: 8,
      comment:
        "It's not a free option when you are starting out as a streamer.",
      platform: 'twitchtv',
      product: 'studio',
      timestamp: '2023-05-09T07:19:17.742Z',
      formattedTimestamp: 'May 9 2023',
      deleted: false,
    },
  ],
  currentStatistics: {
    nps_score: 40,
    nps_mean_score: 8.11,
    nps_groups: {
      promoters: { percent: 63.16, count: 48 },
      passives: { percent: 14.47, count: 11 },
      detractors: { percent: 22.37, count: 17 },
    },
    response_rate: 19,
    review_count: 76,
    rating_groups: {
      zero: { percent: 3.95, count: 3 },
      one: { percent: 3.95, count: 3 },
      two: { percent: 0, count: 0 },
      three: { percent: 2.63, count: 2 },
      four: { percent: 0, count: 0 },
      five: { percent: 3.95, count: 3 },
      six: { percent: 7.89, count: 6 },
      seven: { percent: 7.89, count: 6 },
      eight: { percent: 6.58, count: 5 },
      nine: { percent: 7.89, count: 6 },
      ten: { percent: 55.26, count: 42 },
    },
  },
  previousStatistics: {
    nps_score: 42,
    nps_mean_score: 8.07,
    nps_groups: {
      promoters: { percent: 63.46, count: 66 },
      passives: { percent: 15.38, count: 16 },
      detractors: { percent: 21.15, count: 22 },
    },
    response_rate: 19,
    review_count: 104,
    rating_groups: {
      zero: { percent: 7.69, count: 8 },
      one: { percent: 0, count: 0 },
      two: { percent: 0.96, count: 1 },
      three: { percent: 1.92, count: 2 },
      four: { percent: 0, count: 0 },
      five: { percent: 5.77, count: 6 },
      six: { percent: 4.81, count: 5 },
      seven: { percent: 7.69, count: 8 },
      eight: { percent: 7.69, count: 8 },
      nine: { percent: 8.65, count: 9 },
      ten: { percent: 54.81, count: 57 },
    },
  },
}
