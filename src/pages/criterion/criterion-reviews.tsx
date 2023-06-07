import * as RM from '@rainmaker/ui'
import moment from 'moment'
import { useRef, useState } from 'react'
import { useSidebar } from '../../SideBar'
import {
  Body,
  Checkbox,
  Color,
  Heading2,
  Heading3,
  IconButton,
  Label,
  TextItem,
} from '../../ui'
import { Box, Column, Row } from '../../ui/Layout'
import { useAPI } from '../../utils/fetch-api'
import { copyToClipboard } from '../../utils/helpers'
import { User } from '../studio/studio-types'
import { useCriterion } from './criterion-context'
import { Review } from './criterion-data'
import { formatTimestamp } from '../../utils/date-formatter'
import { CriterionReviewHistory } from '../studio/user/studio-user-components'
import { StudioUserProvider, useStudio, useStudioUser } from '../studio/user/studio-user-context'

export const CriterionReviews = () => {
  const ctx = useCriterion()
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const reviews = ctx.filteredReviews

  return (
    <Column width="100%" alignItems="stretch">
      <Filters />
      <RM.PaginatedTable
        fetching={false}
        limit={limit}
        total={reviews.length}
        page={page}
        defaultSort={null}
        data={reviews.slice(limit * page, limit * (page + 1))}
        rowComponent={ReviewItem}
        onChange={(data) => {
          setPage(data.page)
          setLimit(data.limit)
        }}
      />
    </Column>
  )
}

const ReviewItem = ({ item }: { item: Review }) => {
  const { setSidebar } = useSidebar()
  const userUrl = `/studio/users/${item.userId}`
  const { localTime, utcTime } = formatTimestamp(item.timestamp)

  const DetailsBody = useRef(() => {
    const user = useStudioUser(item.userId)
    const dateDiff = user
      ? moment(item.timestamp).diff(moment(user.createdAt), 'days')
      : null

    return (
      <Column gap={8}>
        <Row gap={8} height={40}>
          <Label text="Rating" width={120} />
          <TextItem text={item.rating} fontSize={18} marginLeft={6} />
        </Row>
        <Row gap={8} height={40}>
          <Label text="User" width={120} />
          <Box href={userUrl} target="_blank" tooltip="View user page">
            <IconButton size={30} icon="faUserCircle" />
          </Box>
          <TextItem text={item.userId} selectOnClick={true} />
        </Row>
        <Row gap={8} height={40}>
          <Label text="Review Date" width={120} />
          <Box tooltip="Copy review date">
            <IconButton
              size={30}
              icon="faCalendarAlt"
              onClick={() => copyToClipboard(utcTime)}
            />
          </Box>
          <Box tooltip={utcTime}>{localTime}</Box>
        </Row>
        <Row gap={8} height={40}>
          <Label text="Account Age" width={120} />
          <Box tooltip="Age at time of review">
            {dateDiff ? dateDiff + ' days' : 'Loading...'}
          </Box>
        </Row>
        <Row gap={8} minHeight={40}>
          <Label text="Comment" width={120} />
          {item.comment && <Body text={item.comment} />}
          {!item.comment && (
            <Body text="No comment" italic={true} opacity={0.3} />
          )}
        </Row>
        <Column marginTop={30} gap={10}>
          <Heading3 text="User Review History" />
          {!user && <TextItem muted={true} text="Loading..." />}
          {user && <CriterionReviewHistory user={user} />}
        </Column>
      </Column>
    )
  })

  const viewDetails = () => {
    setSidebar({
      header: <Heading2 text="User Review" />,
      body: (
        <StudioUserProvider>
          <DetailsBody.current />
        </StudioUserProvider>
      ),
    })
  }

  return (
    <>
      <RM.TableRowItem width={60}>
        <Box fontSize={15}>{item.rating}</Box>
      </RM.TableRowItem>
      <RM.TableRowItem>
        {item.comment ? (
          <Box>{item.comment}</Box>
        ) : (
          <Box style={{ fontStyle: 'italic', opacity: 0.5 }}>No comment</Box>
        )}
      </RM.TableRowItem>
      <RM.TableRowItem width="25%">
        <Row alignItems="center" tooltip={`Reviewed at: ${utcTime}`}>
          <IconButton
            icon="faCalendarAlt"
            onClick={() => copyToClipboard(utcTime)}
          />
          {localTime}
        </Row>
      </RM.TableRowItem>
      <RM.TableRowItem width={100}>
        <Box opacity={0.6} fontSize={10} style={{ textTransform: 'uppercase' }}>
          {item.product}
        </Box>
      </RM.TableRowItem>
      <RM.TableRowItem width={50}>
        <RM.Tooltip position="top" message="View details" variant="detailed">
          <IconButton icon="faInfo" onClick={viewDetails} />
        </RM.Tooltip>
      </RM.TableRowItem>
      <RM.TableRowItem width={30}>
        <Box
          href={userUrl}
          target="_blank"
          cursor="pointer"
          tooltip="View user page"
        >
          <IconButton size={30} icon="faUserCircle" />
        </Box>
      </RM.TableRowItem>
      {/* <RM.TableRowItem>
        <Box justifyContent="flex-end" width="100%">
          <BrandBubble name={item.platfoRM} />
        </Box>
      </RM.TableRowItem> */}
      {/* <RM.TableRowItem>
        <Box fontSize={12}>
          <RM.Button variant="secondary" onClick={() => copyEmail(item.userId)}>
            Copy Email
          </RM.Button>
        </Box>
      </RM.TableRowItem> */}
    </>
  )
}

const Filters = () => {
  const { filters, setFilters, data, filteredReviews, isAnyFilterSet } =
    useCriterion()
  const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  return (
    <Column>
      <Row
        width="100%"
        marginBottom={10}
        gap={8}
        alignItems="flex-end"
        justifyContent="space-between"
      >
        <Column gap={8}>
          <Label text="Filter by rating" />
          <Row gap={4}>
            {RATINGS.map((x) => (
              <RatingFilter rating={x} key={x} />
            ))}
            {filters.ratings.length !== 10 && (
              <Box tooltip="Reset">
                <IconButton
                  marginLeft={4}
                  icon="faUndo"
                  size={16}
                  onClick={() => {
                    setFilters({
                      ...filters,
                      ratings: RATINGS,
                    })
                  }}
                />
              </Box>
            )}
          </Row>
        </Column>
        <Checkbox
          checked={filters.commentsOnly}
          text="Show comments only"
          onChange={(checked) =>
            setFilters({ ...filters, commentsOnly: checked })
          }
        />
      </Row>
      {isAnyFilterSet && (
        <Row gap={6} marginBottom={6}>
          <Body
            text={`Displaying ${filteredReviews.length} of ${data.reviews.length} reviews`}
          />
          <Body
            muted={true}
            italic={true}
            text={`(${
              data.reviews.length - filteredReviews.length
            } hidden by filter)`}
          />
        </Row>
      )}
    </Column>
  )
}

const RatingFilter = ({ rating }: { rating: number }) => {
  const { filters, setFilters } = useCriterion()
  const filteredRatings = new Set(filters.ratings)
  const checked = filteredRatings.has(rating)

  return (
    <Checkbox
      checked={checked}
      appearance="icon"
      onChange={(checked) => {
        if (checked) {
          filteredRatings.add(rating)
        } else {
          filteredRatings.delete(rating)
        }
        setFilters({
          ...filters,
          ratings: Array.from(filteredRatings),
        })
      }}
      content={
        <Box
          alignItems="center"
          justifyContent="center"
          width={22}
          height={22}
          opacity={checked ? 1 : 0.3}
          style={{
            background: Color.neutral(700),
          }}
          hover={{
            background: Color.neutral(600),
          }}
        >
          <TextItem
            text={rating}
            fontSize={12}
            color="neutral"
            colorWeight={0}
          />
        </Box>
      }
    />
  )
}

const copyEmail = async (userId: string) => {
  const response = await fetch(`/api/users/${userId}/email`)
  const result = await response.json()
  copyToClipboard(result.email)
}
