import { Column, Row } from '../../../ui'
import { useCurrentStudioUser } from './studio-user-context'
import { BroadcastsTable } from '../../../components/BroadcastsTable'
import type * as Studio from '../studio-types'

export const StudioUserBroadcasts = () => {
  const user = useCurrentStudioUser()

  return (
    <Column>
      <BroadcastsTable
        limit={10}
        broadcasts={user.broadcasts.list}
      />
    </Column>
  )
}
