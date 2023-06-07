import * as React from 'react'
import { Color, IconButton } from './ui'
import { Box, Column, Row } from './ui/Layout'
import useRenderTransition from './ui/hooks/useRenderTransition'
import { subscribeToEscape } from './utils/escape-context'

const isEmbedded = window.self !== window.top

const Underlay = () => {
  const { closeSidebar } = useSidebar()

  return (
    <div
      onClick={closeSidebar}
      style={{
        left: 0,
        top: 0,
        zIndex: 2,
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        backgroundColor: isEmbedded ? 'transparent' : 'rgba(0,0,0,30%)',
      }}
    />
  )
}

const SidebarHeader = (props: { children?: React.ReactNode }) => {
  const { closeSidebar } = useSidebar()
  React.useEffect(() => subscribeToEscape(closeSidebar), [])

  return (
    <Row
      style={{
        justifyContent: 'space-between',
        paddingBottom: 10,
        width: '100%',
        borderBottom: Color.neutral(500),
      }}
    >
      <Box>{props.children}</Box>
      <div className="sidebar-close-button">
        <IconButton size={30} icon="Close" onClick={closeSidebar} />
      </div>
    </Row>
  )
}

const Body = (props: { children: React.ReactNode }) => {
  return (
    <Column paddingTop={20} style={{ overflowY: 'auto', height: '100%' }}>
      {props.children}
    </Column>
  )
}

const SidebarContainer = (props: {
  header?: React.ReactNode
  children: React.ReactNode
}) => {
  const { closeSidebar, state } = useSidebar()
  React.useEffect(() => subscribeToEscape(closeSidebar), [])
  const { ref, style } = useRenderTransition(
    {
      right: '-100%',
    },
    {
      right: 0,
    },
  )

  return (
    <Column
      style={{
        right: 0,
        top: 0,
        padding: 26,
        zIndex: 2,
        height: '100%',
        position: 'absolute',
        width: state.width || 600,
        background: `linear-gradient(0deg,${Color.neutral(900)},${Color.neutral(
          800,
        )})`,
        ...style,
      }}
      forwardedRef={ref}
    >
      <SidebarHeader>{props.header ?? false}</SidebarHeader>
      <Body>{props.children}</Body>
    </Column>
  )
}

const SidebarRoot = (props: SidebarState) => {
  if (props.body) {
    return (
      <>
        <Underlay />
        <SidebarContainer header={props.header}>{props.body}</SidebarContainer>
      </>
    )
  } else {
    return <></>
  }
}

export type SidebarState = {
  header?: React.ReactNode
  body?: React.ReactNode
  width?: number | string
}

type SidebarContext = {
  state?: SidebarState
  setSidebar: (sidebarState?: SidebarState) => void
  closeSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext>({
  state: null,
  setSidebar: () => {},
  closeSidebar: () => {},
})

export const SidebarProvider = (props: { children: React.ReactNode }) => {
  const [state, setSidebar] = React.useState<SidebarState>({})
  const closeSidebar = () => setSidebar({})

  return (
    <SidebarContext.Provider
      value={{
        state,
        setSidebar,
        closeSidebar,
      }}
    >
      {props.children}
      <SidebarRoot header={state.header} body={state.body} />
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => React.useContext(SidebarContext)
