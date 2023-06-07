import { Box } from '../Layout'
import { Body, Link } from '../text/Text'

interface DefaultProps {
  // String or Text component
  title: string | JSX.Element
  description: string
  link?: string
  linkTitle?: string
}

const Default = (props: DefaultProps) => {
  return (
    <Box minWidth={250}>
      <Box style={{ padding: '8px 12px' }}>
        <Box marginBottom={5}>
          {typeof props.title === 'string' ? (
            <Body
              color="neutral"
              colorWeight={1000}
              fontSize={16}
              fontWeight={700}
              style={{
                margin: '0 0 0 auto',
              }}
              text={props.title}
            />
          ) : (
            props.title
          )}
        </Box>
        <Body
          color="neutral"
          colorWeight={1000}
          fontSize={12}
          fontWeight={400}
          text={props.description}
        />
        {props.link && (
          <Link
            fontSize={12}
            marginTop={5}
            text={props.linkTitle}
            href={props.link}
            target="_blank"
            color="primary"
            style={{ textDecoration: 'none', cursor: 'pointer' }}
            fontWeight={700}
            colorWeight={500}
          />
        )}
      </Box>
    </Box>
  )
}

export default {
  Default,
}
