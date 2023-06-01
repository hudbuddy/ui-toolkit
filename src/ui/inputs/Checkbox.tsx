import React, { useRef } from 'react'
import { classes, style } from 'typestyle'
import { Box } from '../Layout'
import * as Color from '../colors'
import { Icon } from '../icons/Icon'
import { CustomText, TextBuilder, TextBuilderProps } from '../text/Text'

export type CheckboxProps = {
  checked: boolean
  onChange: (value: boolean) => void
  appearance?: 'outline' | 'icon'
  disabled?: boolean
  text?: string | TextBuilderProps['text']
  width?: React.CSSProperties['width']
  height?: React.CSSProperties['height']
  fillColor?: Color.Type
  fillColorWeight?: number
  color?: Color.Type
  colorWeight?: number
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
  width = 20,
  height = 20,
  color = 'neutral',
  colorWeight = 500,
  fillColor,
  fillColorWeight = 500,
  content,
  disabled = false,
  focusIndicator = false,
  children,
}: CheckboxProps & {
  content?: React.ReactNode
}) => {
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
      flexBasis="fit-content"
      alignItems="center"
      justifyContent="flex-start"
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
          checked={checked}
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
            position: 'absolute',
          }}
        />
        {checked &&
          (content || (
            <Box
              height="120%"
              width="120%"
              alignItems="center"
              justifyContent="center"
              opacity={1}
            >
              <Icon
                name="Checkmark"
                color="neutral"
                colorWeight={0}
                width="100%"
                height="100%"
              />
            </Box>
          ))}
        {!checked && content}
      </Box>
      {text && (
        <Box marginLeft={8}>
          {typeof text === 'string' ? (
            <CustomText lineHeight={1.2} text={text} />
          ) : (
            <TextBuilder lineHeight={1.4} text={text} insertSpaces={false} />
          )}
        </Box>
      )}
      {children && <Box marginLeft={8}>{children}</Box>}
    </Box>
  )
}

export { Checkbox }
export default Checkbox
