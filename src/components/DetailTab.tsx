import { classes, style } from "typestyle"
import { Box, Color, Column } from "../ui"

const tabStyle = style({
  cursor: 'pointer',
  padding: '10px 0',
  color: Color.neutral(400),
  height: 62,
  width: 120,
  $nest: {
    '&:hover': {
      color: 'rgba(255,255,255,100%)',
    },
    '&.active': {
      color: 'rgba(255,255,255,100%)',
      borderBottom: '2px solid ' + Color.neutral(0),
    },
  },
})

export const DetailTab = (props: {
  label: string
  count: number
  isActive: boolean
  onClick: () => void
}) => (
  <Column
    className={classes(props.isActive && 'active', tabStyle)}
    alignItems="center"
    onClick={props.onClick}
    gap={4}
  >
    <Box fontSize={24}>{props.count}</Box>
    <Box
      style={{
        textTransform: 'uppercase',
        fontSize: 12,
      }}
    >
      {props.label}
    </Box>
  </Column>
)
