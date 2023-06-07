import {
  RouteObject,
  useNavigate,
  redirect as _redirect,
} from 'react-router-dom'
import { VipPage } from './pages/admin/vip-page'
import { BroadcastsPage } from './pages/studio/broadcasts/broadcasts-page'
import { JobyUserPage } from './pages/joby/user/joby-user-page'
import { StudioUserPage } from './pages/studio/user/studio-user-page'
import { CriterionPage } from './pages/criterion/criterion-page'
import { NotFound } from './pages/404'

export type LabeledRouteObject = RouteObject & {
  label: string
  element: () => JSX.Element
  children?: LabeledRouteObject[]
}

const routes: RouteObject[] = [
  {
    path: '/v2',
    label: 'Broadcasts',
    element: () => <BroadcastsPage />,
  },
  {
    path: '/v2/criterion',
    label: 'Criterion',
    element: () => <CriterionPage />,
  },
  {
    path: '/v2/admin',
    label: 'Admin',
    children: [
      {
        path: '/v2/admin/vip',
        label: 'VIP',
        element: () => <VipPage />,
      },
    ],
  },
  {
    path: '/v2/joby',
    label: 'Joby',
    children: [
      {
        path: '/v2/joby/users/:id',
        label: 'User',
        element: () => <JobyUserPage />,
      },
    ],
  },
  {
    path: '/v2/studio',
    label: 'Studio',
    children: [
      {
        path: '/v2/studio/users/:id',
        label: 'User',
        element: () => <StudioUserPage />,
        children: [
          {
            path: '/v2/studio/users/:id/projects/:projectId',
            label: 'User',
            element: () => <StudioUserPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/*',
    element: () => <NotFound />
  }
] as LabeledRouteObject[]

export const useRedirect = () => {
  const navigate = useNavigate()

  const redirect = (path: string) => {
    if (window.self !== window.top) {
      window.top!.postMessage({
        event: 'redirect',
        payload: { path },
      })
    } else {
      navigate('/v2' + path + document.location.search)
    }
  }

  return redirect
}

// Necessary for HMR
const resolveRouteElements = (routes) => {
  routes.forEach((x: any) => {
    if (x.element) x.element = x.element()
    if (x.children) resolveRouteElements(x.children)
  })
}

let _routesInitted = false
export const getRoutes = () => {
  if (!_routesInitted) {
    _routesInitted = true
    resolveRouteElements(routes)
  }
  return routes as LabeledRouteObject[]
}

export const openLink = (path: string) => {
  if (window.self !== window.top) {
    window.top!.postMessage({
      event: 'open-link',
      payload: { path },
    })
  } else {
    window.open('/v2' + path + document.location.search, '_blank').focus()
  }
}
