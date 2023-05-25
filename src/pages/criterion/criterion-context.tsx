import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { CriterionData, getCriterionStatistics } from './criterion-data'

export enum DateRange {
  PAST_WEEK,
  PAST_MONTH,
  PAST_3_MONTHS,
  PAST_6_MONTHS,
  ALL_TIME,
}

type RangeData = {
  days: number
  tagline: string
  displayName: string
  _cache: CriterionData | null
}

export const DATE_RANGES = {
  [DateRange.PAST_WEEK]: {
    days: 7,
    tagline: 'Compared with previous week',
    displayName: 'Past Week',
    _cache: null,
  } as RangeData,
  [DateRange.PAST_MONTH]: {
    days: 30,
    tagline: 'Compared with previous month',
    displayName: 'Past Month',
    _cache: null,
  } as RangeData,
  [DateRange.PAST_3_MONTHS]: {
    days: 90,
    tagline: 'Compared with previous 3 months',
    displayName: 'Past 3 Months',
    _cache: null,
  } as RangeData,
  [DateRange.PAST_6_MONTHS]: {
    days: 180,
    tagline: 'Compared with previous 6 months',
    displayName: 'Past 6 Months',
    _cache: null,
  } as RangeData,
  [DateRange.ALL_TIME]: {
    days: null, // Return all results
    tagline: 'No comparison available',
    displayName: 'All Time',
    _cache: null,
  } as RangeData,
}

const CriterionContext = createContext<CriterionState>({} as CriterionState)
type CriterionState = {
  data: CriterionData
  dateRange: DateRange
  rangeData: RangeData
  setDateRange: (range: DateRange) => void
}

export const CriterionProvider = ({ children }: { children: ReactNode }) => {
  const [dateRange, setDateRange] = useState<DateRange>(DateRange.PAST_WEEK)
  const [data, setData] = useState<CriterionData>(DATE_RANGES[dateRange]._cache)
  DATE_RANGES[dateRange]._cache = data

  useEffect(() => {
    if (DATE_RANGES[dateRange]._cache) return
    getCriterionStatistics(DATE_RANGES[dateRange].days).then(setData)
  }, [dateRange])

  return (
    <CriterionContext.Provider
      value={{
        dateRange,
        rangeData: DATE_RANGES[dateRange],
        setDateRange,
        data,
      }}
    >
      {children}
    </CriterionContext.Provider>
  )
}

export const useCriterion = () => useContext(CriterionContext)
