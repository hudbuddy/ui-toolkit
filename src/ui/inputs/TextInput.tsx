import React, { useState, useEffect } from 'react'
import * as Color from '../colors'
import { classes, style } from 'typestyle'
import { Box, Column, Row } from '../Layout'
import { CustomText } from '../text/Text'
import useElementFromRef from '../hooks/useElementFromRef'
import useResizeObserver from '../hooks/useResizeObserver'
import { Icon } from '..'

export type TextInputProps = {
  className?: string
  value?: string
  defaultValue?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onClick?: React.MouseEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>
  appearance?: 'solid' | 'outline' | 'text'
  disabled?: boolean
  invalid?: boolean
  multiline?: boolean
  placeholder?: string
  uppercase?: boolean
  width?: React.CSSProperties['width']
  height?: React.CSSProperties['height']
  name?: string
  color?: Color.Type
  colorWeight?: number
  textColor?: Color.Type
  textColorWeight?: number
  maxLength?: number
  hideCharacterCount?: boolean
  minHeight?: number
  maxHeight?: number
  marginLeft?: number
  marginTop?: number
  autoFocus?: boolean
  autoHeight?: boolean
  selectOnFocus?: boolean
  required?: boolean
  readOnly?: boolean
  autoComplete?: 'on' | 'off' | string
  fontSize?: number
  paddingX?: number
  paddingY?: number
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url'
  label?: JSX.Element
  prefixComponent?: JSX.Element
  // Avoid
  style?: React.CSSProperties
}

/** Styles */

const important = (x: string) => `${x} !important`

const containerStyle = style({
  borderStyle: `solid`,
  borderWidth: 1,
  borderRadius: 4,
  padding: `0 .9em 0`,
  lineHeight: 1,
  fontWeight: 300,
  fontSize: 'inherit',
  outline: 'none',
  userSelect: 'none',
  width: '100%',
  maxWidth: 'none',
  cursor: 'text',
})

export const inputStyle = style({
  justifySelf: 'stretch',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  lineHeight: 1,
  fontWeight: 300,
  fontSize: 'inherit',
  userSelect: 'none',
  width: '100%',
  maxWidth: 'none',
  resize: 'none',
  textOverflow: 'ellipsis',
  color: 'inherit',
  $nest: {
    '&::placeholder': {
      fontWeight: 400,
      fontSize: 13,
    },
  },
})

const hideEmpty = style({
  $nest: {
    '&:empty': {
      display: important('none'),
    },
  },
})
export const modify = ({
  appearance,
  disabled,
  invalid,
  multiline,
  color,
  colorWeight,
  textColor,
  textColorWeight,
  prefixComponent,
}: TextInputProps) => {
  const colors = {
    box: Color[color](colorWeight),
    text: Color[textColor](textColorWeight),
  }

  return style({
    borderColor: colors.box,
    backgroundColor: colors.box,
    color: colors.text,
    ...(disabled && {
      pointerEvents: 'none',
      opacity: 0.5,
    }),
    ...(appearance === 'outline' && {
      backgroundColor: 'transparent',
    }),
    ...(appearance === 'text' && {
      padding: '0 0.3em',
      borderColor: 'transparent',
      backgroundColor: 'transparent',
    }),
    ...(invalid && {
      borderColor: important(Color.secondary(500)),
    }),
    ...(multiline && {
      padding: '0.8em 0.9em',
    }),
    ...(prefixComponent && {
      paddingLeft: '0.3em',
    }),
    $nest: {
      ...(appearance === 'outline' && {
        '&::placeholder': {
          color: 'rgb(255 255 255 / 50%)',
          fontWeight: 400,
        },
      }),
      ...(!disabled &&
        appearance !== 'text' && {
          '&:hover': {
            borderColor: colors.box,
            ...(appearance === 'solid' && {
              backgroundColor: colors.box,
            }),
            ...(invalid && {
              borderColor: important(Color.secondary(500)),
            }),
          },
          '&:focus, &:focus-within': {
            borderColor: Color.primary(500),
            ...(invalid && {
              borderColor: important(Color.secondary(500)),
            }),
          },
        }),
    },
  })
}

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value))
}

const TextInput = ({
  value,
  onChange,
  onFocus,
  onBlur,
  onClick,
  onKeyUp,
  onKeyDown,
  label,
  type = 'text',
  name,
  appearance = 'outline',
  width,
  height = '100%',
  disabled = false,
  invalid = false,
  uppercase = false,
  selectOnFocus = false,
  multiline = false,
  autoHeight = false,
  required = false,
  hideCharacterCount = false,
  readOnly = false,
  minHeight = 30,
  maxHeight = 600,
  marginLeft,
  marginTop,
  fontSize,
  placeholder = '',
  color = 'neutral',
  colorWeight = 500,
  textColor = 'neutral',
  textColorWeight = 0,
  paddingX,
  paddingY,
  maxLength,
  autoFocus,
  autoComplete,
  defaultValue,
  style = {},
  prefixComponent,
  className,
}: TextInputProps) => {
  const [startValue] = useState(value || defaultValue)
  const [numChars, setNumChars] = useState(startValue ? startValue.length : 0)

  const _onFocus: TextInputProps['onFocus'] = (e) => {
    if (selectOnFocus) {
      ;(e.target as HTMLInputElement).select()
    }
    if (onFocus) onFocus(e)
  }

  const _onChange: TextInputProps['onChange'] = (e) => {
    updateHeight()
    setNumChars(e.target.value.length)
    if (typeof defaultValue !== 'undefined' && !onChange) return
    onChange(e)
  }

  const [currentHeight, setCurrentHeight] = useState(height)
  const [ref, el] = useElementFromRef<HTMLInputElement>()
  const [hiddenRef, hiddenEl] = useElementFromRef<HTMLTextAreaElement>()

  const updateHeight = () => {
    if (!autoHeight || !multiline || !el || !hiddenEl) return
    hiddenEl.value = el.value

    // 4 is a buffer to account for unknown diff between scrollHeight and true height
    const newHeight = clamp(hiddenEl.scrollHeight + 4, minHeight, maxHeight)
    const previousHeight = typeof currentHeight === 'number' ? currentHeight : 0

    // Prevent jitter due to inconsistencies in scroll height
    if (Math.abs(newHeight - previousHeight) < 4) {
      return
    }

    setCurrentHeight(newHeight)

    if (newHeight > previousHeight) {
      el.scrollTo({ top: el.offsetHeight })
    }
  }

  useResizeObserver([hiddenEl], () => {
    updateHeight()
  })

  useEffect(() => {
    updateHeight()
  }, [])

  const _className = classes(
    containerStyle,
    modify({
      appearance,
      disabled,
      invalid,
      multiline,
      color,
      colorWeight,
      textColor,
      textColorWeight,
      prefixComponent,
    }),
    className,
  )

  const props = {
    type,
    name,
    value,
    placeholder,
    disabled,
    required,
    maxLength,
    autoFocus,
    autoComplete,
    readOnly,
    onChange: _onChange,
    onFocus: _onFocus,
    onKeyUp,
    onKeyDown,
    onBlur,
    onClick,
    ...(defaultValue && { defaultValue }),
    style: {
      width,
      height,
      minWidth: width || 'fit-content',
      marginLeft,
      marginTop,
      fontSize,
      textTransform: uppercase ? 'uppercase' : null,
      ...(paddingX && {
        paddingLeft: paddingX,
        paddingRight: paddingX,
      }),
      ...(paddingY && {
        paddingTop: paddingY,
        paddingBottom: paddingY,
      }),
      ...style,
    } as React.CSSProperties,
  }

  return (
    <Column height="auto" width={width || '100%'} onClick={() => el?.focus()}>
      <Row
        className={hideEmpty}
        justifyContent="space-between"
        fontSize={13}
        marginBottom={7}
        width="100%"
        style={{
          color: Color[color](colorWeight),
        }}
      >
        {label}
        {maxLength && !hideCharacterCount && (
          <Box alignItems="center" marginLeft="auto">
            <CustomText text={numChars} />
            {' / '}
            <CustomText text={maxLength} />
          </Box>
        )}
      </Row>
      <Row className={_className}>
        {prefixComponent}
        {multiline ? (
          <>
            <textarea
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
              ref={hiddenRef}
              style={{
                ...props.style,
                position: 'absolute',
                pointerEvents: 'none',
                visibility: 'hidden',
                overflow: 'hidden',
                height: 0,
              }}
            />
            <textarea
              className={inputStyle}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
              ref={ref as any}
              style={{
                ...props.style,
                height: currentHeight,
              }}
            />
          </>
        ) : (
          <input
            ref={ref}
            className={inputStyle}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </Row>
    </Column>
  )
}

export const SearchInput = (props: TextInputProps) => {
  return (
    <TextInput
      height={30}
      appearance="text"
      placeholder="Search..."
      prefixComponent={
        <Box marginRight={2}>
          <Icon size={24} name="faSearch" color="neutral" colorWeight={300} />
        </Box>
      }
      {...props}
    />
  )
}

export { TextInput }
export default TextInput
