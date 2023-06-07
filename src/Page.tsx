import 'react'
import { Heading2 } from './ui'
import { Row } from './ui/Layout'

export const Page = ({
  title,
  children,
  showTitle = false,
}: {
  title: string
  children: React.ReactNode
  showTitle?: boolean
}) => {
  if (title) document.title = title

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
      }}
    >
      <div
        style={{
          flexGrow: 1,
          overflowY: 'auto',
        }}
      >
        {title && showTitle && (
          <Row
            position="sticky"
            style={{ top: 0, height: 32, background: '#2c2c3c', zIndex: 3, alignItems: 'flex-start' }}
          >
            <Heading2 text={title} />
          </Row>
        )}
        <div
          className="page-content"
          style={{
            width: '100%',
            height: '100%',
            maxWidth: 1400,
            paddingRight: 32,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
