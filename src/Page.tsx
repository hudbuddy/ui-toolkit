import 'react'
import { Row } from './ui/Layout'
import { Heading2, Heading3 } from './ui'

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
      {title && showTitle && (
        <Row>
          <Heading2
            text={title}
            style={{
              marginBottom: 26,
            }}
          />
        </Row>
      )}
      <div
        style={{
          flexGrow: 1,
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  )
}
