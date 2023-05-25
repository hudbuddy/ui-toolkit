import { Box } from '../Layout'
import { Checkbox } from './Checkbox'
import { style } from 'typestyle'
import { IconName } from '../icons/Icon'
import * as Color from '../colors'

const SWITCH_TRANSITION_TIMING = 120

interface ToggleProps {
  value: boolean
  onChange: (value: boolean) => void
  // Default color
  color?: Color.Type
  colorWeight?: number
  // Color when toggle is "off" (left-positioned)
  offColor?: Color.Type
  offColorWeight?: number
  // Color when toggle is "on" (right-positioned)
  onColor?: Color.Type
  onColorWeight?: number
  disabled?: boolean
  height?: number
  width?: number
  padding?: number | string
  // Why not?
  icon?: IconName
  iconScale?: number
}
const Toggle = ({
  value,
  onChange,
  color = 'neutral',
  colorWeight = 0,
  offColor = 'neutral',
  offColorWeight = 400,
  onColor = 'primary',
  onColorWeight = 500,
  disabled = false,
  height = 20,
  width,
  padding = 2,
  icon = 'Circle',
  iconScale = 1,
}: ToggleProps) => {
  const colors = {
    base: Color[color](colorWeight),
    off: Color[offColor](offColorWeight),
    on: Color[onColor](onColorWeight),
  }
  const currentColor = !value ? colors.off : colors.on

  return (
    <Box
      className={style({
        $nest: {
          [`&:focus-within`]: {
            borderColor: colors.on,
          },
        },
      })}
      style={{
        boxShadow: `0 0 0 1px inset ${currentColor}`,
        background: currentColor,
        borderRadius: 100,
        cursor: 'pointer',
        transition: `${SWITCH_TRANSITION_TIMING}ms ease all`,
      }}
      alignItems="center"
      width={width || height * 1.8}
      height={height}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) onChange(!value)
      }}
    >
      <Box
        height={height}
        width={height}
        style={{
          padding,
          pointerEvents: 'none',
          transition: `${SWITCH_TRANSITION_TIMING}ms ease all`,
          position: 'relative',
          left: value ? '100%' : 0,
          transform: `translate3d(${value ? '-100%' : '0'}, 0, 0)`,
        }}
      >
        <Checkbox
          appearance="icon"
          iconColor={color}
          iconColorWeight={colorWeight}
          uncheckedIcon={icon}
          checkedIcon={icon}
          disabled={disabled}
          checked={value}
          onChange={() => {
            /*Triggered by onClick of container*/
          }}
          iconUncheckedOpacity={1}
          iconScale={iconScale}
        />
      </Box>
    </Box>
  )
}

export default Toggle
export { Toggle }
