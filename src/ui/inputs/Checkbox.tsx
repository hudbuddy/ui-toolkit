import React, { useRef } from 'react'
import { classes, style } from 'typestyle'
import * as Color from '../colors'
import { Icon, IconName } from '../icons/Icon'
import { Box } from '../Layout'
import { TextBuilder, TextBuilderProps, CustomText } from '../text/Text'

export type CheckboxProps = {
  checked: boolean
  onChange: (value: boolean) => void
  uncheckedIcon?: IconName
  checkedIcon?: IconName
  appearance?: 'outline' | 'icon'
  disabled?: boolean
  text?: string | TextBuilderProps['text']
  color?: Color.Type
  colorWeight?: number
  iconColor?: Color.Type
  iconColorWeight?: number
  fillColor?: Color.Type
  fillColorWeight?: number
  width?: React.CSSProperties['width']
  height?: React.CSSProperties['height']
  focusIndicator?: boolean
  // Area filled as a scalar
  iconScale?: number
  // Opacity of icon in unchecked state (for use with with appearance="icon")
  iconUncheckedOpacity?: number
  children?: JSX.Element
}

const baseClass = style({
  position: 'relative',
  borderStyle: `solid`,
  borderWidth: 1,
  borderRadius: 2,
  lineHeight: 1,
  fontWeight: 500,
  outline: 'none',
})

const Checkbox = ({
  checked,
  onChange,
  appearance,
  text,
  width = '100%',
  height = '100%',
  uncheckedIcon,
  checkedIcon = 'Checkmark',
  disabled = false,
  iconScale = 1.2,
  iconUncheckedOpacity = 0.5,
  color = 'neutral',
  colorWeight = 500,
  fillColor,
  fillColorWeight = 500,
  iconColor = 'neutral',
  iconColorWeight = 0,
  focusIndicator = false,
  children,
}: CheckboxProps) => {
  const input = useRef(null)

  const onClick = () => {
    input.current.click()
  }
  const onFocus = () => {
    input.current.focus()
  }

  return (
    <Box
      tabIndex={-1}
      onClick={onClick}
      onFocus={onFocus}
      height={height}
      alignItems="center"
      inline={true}
      className={style({
        $nest: focusIndicator
          ? {
              '&:focus-within': {
                outline: '1px solid ' + Color.primary(500),
                outlineOffset: 3,
              },
            }
          : {},
      })}
      style={{
        width: '100%',
        userSelect: 'none',
        cursor: 'pointer',
        position: 'relative',
        ...(disabled && {
          pointerEvents: 'none',
          opacity: 0.5,
        }),
      }}
    >
      <Box
        className={classes(baseClass)}
        width={width}
        height={height}
        alignItems="center"
        justifyContent="center"
        style={{
          color: Color[color](colorWeight),
          ...(fillColor &&
            checked && {
              border: 'none',
              background: Color[fillColor](fillColorWeight),
            }),
          ...(appearance === 'icon' && {
            border: 'none',
            background: 'transparent',
          }),
        }}
      >
        <input
          defaultChecked={checked}
          ref={input}
          onChange={(e) => {
            if (disabled) return
            onChange(Boolean(e.target.checked))
          }}
          type="checkbox"
          style={{
            margin: 0,
            height: '100%',
            opacity: 0,
            width: 0,
            pointerEvents: 'none',
          }}
        />
        <Box
          height={iconScale * 100 + '%'}
          width={iconScale * 100 + '%'}
          alignItems="center"
          justifyContent="center"
          opacity={checked ? 1 : iconUncheckedOpacity}
        >
          <Icon
            name={checked ? checkedIcon : uncheckedIcon}
            color={iconColor}
            colorWeight={iconColorWeight}
            width="100%"
            height="100%"
          />
        </Box>
      </Box>
      {text && (
        <Box marginLeft="medium">
          {typeof text === 'string' ? (
            <CustomText lineHeight={1.2} text={text} />
          ) : (
            <TextBuilder lineHeight={1.4} text={text} insertSpaces={false} />
          )}
        </Box>
      )}
      {children && <Box marginLeft="medium">{children}</Box>}
    </Box>
  )
}

export { Checkbox }
export default Checkbox
