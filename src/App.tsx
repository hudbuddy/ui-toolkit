import 'react'
import * as ReactRouter from 'react-router-dom'
import { getRoutes } from './router'
import { NavPane } from './NavPane'
import { TopBar } from './TopBar'
import { ErrorBoundary } from './ui/ErrorBoundary'
import { Box, Color } from './ui'
import { useEffect } from 'react'

const queryParams = new URLSearchParams(document.location.search)
const isEmbedded = window.self !== window.top

function App() {
  const page = ReactRouter.useRoutes(getRoutes())

  useEffect(() => {
    document.body.setAttribute('data-embedded', String(isEmbedded))
    if (!isEmbedded) {
      document.body.style.background = `linear-gradient(0deg, ${Color.neutral(
        1000,
      )}, ${Color.neutral(900)})`
    }
  }, [isEmbedded])

  if (!page) {
    console.log('Page not found')
  }

  if (queryParams.get('view') === 'page')
    return <ErrorBoundary>{page}</ErrorBoundary>

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      <TopBar />
      <div
        style={{
          display: 'flex',
          width: '100%',
          flexGrow: 1,
          flexShrink: 1,
          overflow: 'hidden',
        }}
      >
        <NavPane />
        <div style={{ flexGrow: 1, overflow: 'hidden' }}>
          <PageWrapper page={page} />
        </div>
      </div>
    </div>
  )
}

const PageWrapper = ({ page }: { page: JSX.Element }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        paddingTop: 32,
        paddingLeft: 32,
      }}
    >
      <ErrorBoundary>{page}</ErrorBoundary>
    </div>
  )
}

export default App
