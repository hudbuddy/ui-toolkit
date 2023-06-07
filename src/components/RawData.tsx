import { Color } from '../ui'
import { sortObjectKeys } from '../utils/helpers'

export const RawData = ({ data }: { data: object }) => {
  return (
    <pre
      style={{
        margin: 0,
        width: '100%',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        padding: 16,
        lineHeight: 1.3,
        background: Color.neutral(1000),
      }}
    >
      {data ? JSON.stringify(sortObjectKeys(data), null, '  ') : 'Loading...'}
    </pre>
  )
}
