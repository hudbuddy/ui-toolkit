import { LabeledRouteObject, getRoutes, useRedirect } from './router'
import { Button } from './ui'

const RouteList = ({ routes }: { routes: LabeledRouteObject[] }) => {
  const redirect = useRedirect()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* TODO: Rework this when Dev Lite is in use (paths) 
           with wildcards should not be linked */}
      {routes
        .filter((x) => Boolean(x.label))
        .map((route, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              marginTop: 3,
              marginBottom: 3,
              fontSize: 30,
            }}
          >
            <Button
              height={26}
              fontSize={14}
              text={route.label}
              appearance="outline"
              rounded={true}
              color="neutral"
              onClick={() => redirect(route.path.split('/v2')[1])}
            />
            {route.children && (
              <div
                style={{
                  marginTop: 6,
                  marginLeft: 4,
                  paddingLeft: 10,
                  borderLeft: '1px solid rgba(255,255,255,20%)',
                  display: 'flex',
                  justifyContent: 'stretch',
                }}
              >
                <RouteList routes={route.children} />
              </div>
            )}
          </div>
        ))}
    </div>
  )
}

export const NavPane = () => {
  return (
    <div
      style={{
        padding: 16,
        alignSelf: 'stretch',
        justifyContent: 'stretch',
        width: 200,
        flexShrink: 0,
      }}
    >
      <RouteList routes={getRoutes()} />
    </div>
  )
}
