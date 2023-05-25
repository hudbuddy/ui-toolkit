import * as RM from '@rainmaker/ui'
import { useState } from 'react'
import { Box, Column } from '../../ui/Layout'
import { useCriterion } from './criterion-context'
import { Review } from './criterion-data'
import { PlatformBubble } from '../../ui/icons/PlatformBubble'
import { FaIcon } from '../../ui/icons/Icon'
import { copyToClipboard } from '../../utils/helpers'
import { IconButton } from '../../ui'

export const CriterionReviews = () => {
  const ctx = useCriterion()
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const reviews = ctx.data.reviews

  return (
    <Column width="100%" alignItems="stretch">
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
  const url = `/studio/users/${item.userId}`

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
      <RM.TableRowItem width="15%">
        <Box justifyContent="center" width="100%">
          {item.formattedTimestamp}
        </Box>
      </RM.TableRowItem>
      <RM.TableRowItem width={100}>
        <Box opacity={0.6} fontSize={10} style={{ textTransform: 'uppercase' }}>
          {item.product}
        </Box>
      </RM.TableRowItem>
      <RM.TableRowItem width={30}>
        <Box link={url} cursor="pointer" tooltip="View user page">
          <IconButton size={30} icon="faUserCircle" />
        </Box>
      </RM.TableRowItem>
      {/* <RM.TableRowItem>
        <Box justifyContent="flex-end" width="100%">
          <PlatformBubble type={item.platform} />
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

const copyEmail = async (userId: string) => {
  const response = await fetch(`/api/users/${userId}/email`)
  const result = await response.json()
  copyToClipboard(result.email)
}
