import { Box } from '../Layout'
import { Checkbox } from './Checkbox'
import { style } from 'typestyle'
import { Icon, IconName } from '../icons/Icon'
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
  padding?: number
  // Why not?
  icon?: IconName
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
}: ToggleProps) => {
  const colors = {
    base: Color[color](colorWeight),
    off: Color[offColor](offColorWeight),
    on: Color[onColor](onColorWeight),
  }
  const currentColor = !value ? colors.off : colors.on

  return (
    <div
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
        transition: `${SWITCH_TRANSITION_TIMING}ms ease background`,
        position: 'relative',
        width: width || height * 1.8,
        height
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) onChange(!value)
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          inset: 0,
        }}
      >
        <div
          style={{
            padding,
            height,
            width: height,
            pointerEvents: 'none',
            transition: `${SWITCH_TRANSITION_TIMING}ms ease all`,
            position: 'relative',
            left: value ? '100%' : '0px',
            transform: `translate3d(${value ? '-100%' : '0px'}, 0, 0)`,
          }}
        >
          <Checkbox
            appearance="icon"
            disabled={disabled}
            checked={value}
            onChange={() => {
              /*Triggered by onClick of container*/
            }}
            height={height - padding * 2}
            content={
              <Icon
                name={icon}
                color={color}
                colorWeight={colorWeight}
                width={height - padding * 2}
                height={height - padding * 2}
              />
            }
          />
        </div>
      </div>
    </div>
  )
}

export default Toggle
export { Toggle }
