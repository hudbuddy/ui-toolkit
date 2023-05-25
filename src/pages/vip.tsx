import * as Rm from '@rainmaker/ui'
import * as React from 'react'
import { Page } from '../Page'
import { useRedirect } from '../router'
import { Icon, IconButton, Row, SearchInput, TextInput } from '../ui'

type User = {
  id: string
  displayName: string
  email: string
  createdAtRaw: Date
  createdAt: string
  deleted: boolean
  roles: Array<string>
  availableRoles: Array<string>
  subscription?: any | null
  hasAcceptedDatPolicy: boolean
  activeProjectId?: string
  [key: string]: any
}

type TableUser = {
  id: string
  displayName: string
  email: string
  commandProfile: string
}

const TableRow: React.FC<{ item: TableUser; odd: boolean }> = (props: {
  item: TableUser
  odd: boolean
}) => {
  const { item } = props
  const url = `/studio/users/${item.id}`
  const redirect = useRedirect()

  if (!item) {
    return <></>
  }
  return (
    <>
      <Rm.TableRowItem style={{ fontWeight: 700 }}>
        {item.displayName}
      </Rm.TableRowItem>
      <Rm.TableRowItem>{item.email}</Rm.TableRowItem>
      <Rm.TableRowItem>
        <Rm.Tooltip message="View user page" variant="detailed">
          <IconButton
            icon="faUserCircle"
            onClick={() => {
              redirect(url)
            }}
          />
        </Rm.Tooltip>
      </Rm.TableRowItem>
    </>
  )
}

const UserTable = (props: { users: Array<User>; fetching: boolean }) => {
  const { users, fetching } = props
  const [page, setPage] = React.useState(0)
  const limit = 25
  const data = users.map((u) => ({
    id: u.id,
    displayName: u.displayName,
    email: u.email,
    commandProfile: `/studio/users/${u.id}`,
  }))
  return (
    <Rm.PaginatedTable
      limit={limit}
      total={users.length}
      page={page}
      data={data.slice(limit * page, limit * (page + 1))}
      defaultSort="displayName:id"
      fetching={fetching}
      rowComponent={TableRow}
      onChange={(data) => {
        setPage(data.page)
      }}
    />
  )
}

// const baseUrl = 'https://command.lightstream.dev'

async function getVipUsers(): Promise<Array<User>> {
  const response = await fetch(`/api/users?type=vip`, {
    headers: {
      // 'Cache-Control': 'no-cache',
      // 'Access-Control-Allow-Origin': '*',
    },
  })
  return response.json()
}

const userReducer: React.Reducer<Array<User>, Array<User>> = (
  prevState,
  action,
) => action || prevState
const initialState: Array<User> = []

export const VipPage = () => {
  const [users, dispatchUsers] = React.useReducer(userReducer, initialState)
  React.useEffect(() => {
    getVipUsers().then(dispatchUsers)
  }, [])

  const [search, setSearch] = React.useState('')

  const filteredUsers = React.useMemo(() => {
    const searchLowerCase = search.toLowerCase()
    return users.filter((u) => {
      const displayNameMatches = u.displayName
        .toLowerCase()
        .includes(searchLowerCase)
      const emailMatches = u.email.toLowerCase().includes(searchLowerCase)
      return displayNameMatches || emailMatches
    })
  }, [search, users])

  return (
    <Page title="VIP Users" showTitle={true}>
      <SearchInput
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
        }}
      />
      <UserTable users={filteredUsers} fetching={false} />
    </Page>
  )
}
