import * as React from 'react'
import { Box, Heading2 } from './ui'

type Admin = {
  id: string
  firstName: string
  lastName: string
  email: string
  roles: string[]
  permissions: {
    deleteAccountsEnabled: boolean
    deleteProjectsEnabled: boolean
    deleteScenesEnabled: boolean
    deleteAssetsEnabled: boolean
    endBroadcastsEnabled: boolean
    viewWebrtcPageEnabled: boolean
    viewBillingPageEnabled: boolean
    viewAdminPageEnabled: boolean
    viewMixerFeedEnabled: boolean
    resolveFlaggedBroadcastEnabled: boolean
    editCriterionResponsesEnabled: boolean
    editCriterionTriggersEnabled: boolean
    rmcImpersonateChannel: boolean
    rmbImpersonateCompany: boolean
    studio2ImpersonateProject: boolean
  }
  whitelistId: number
  actions: number
}

type AdminContext = {
  admin: Admin
}

const AdminContext = React.createContext<AdminContext>(null)

const adminReducer: React.Reducer<Admin, Admin> = (prevState, action) =>
  action || prevState

export const AdminProvider = (props: { children: React.ReactNode }) => {
  const [admin, setAdmin] = React.useReducer(adminReducer, null)
  React.useEffect(() => {
    fetch(`/api/admins/me`)
      .then((res) => res.json())
      .then(setAdmin)
  }, [])

  return (
    <AdminContext.Provider value={{ admin }}>
      {admin ? (
        props.children
      ) : (
        <Box
          width="100%"
          height="100%"
          alignItems="flex-start"
          justifyContent="center"
        >
          <Heading2 marginTop="20vh" text="Loading..." />
        </Box>
      )}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => React.useContext(AdminContext)
