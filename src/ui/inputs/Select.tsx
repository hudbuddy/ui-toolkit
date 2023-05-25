import React from 'react'
import { style, classes } from 'typestyle'
import { modify, inputStyle, TextInputProps } from './TextInput'

type Value = string | number

type MethodKey = 'onChange' | 'onClick' | 'onFocus' | 'onBlur'

export interface SelectProps<T>
  extends Partial<Omit<TextInputProps, MethodKey>> {
  onChange?: React.ChangeEventHandler<HTMLSelectElement>
  onFocus?: React.FocusEventHandler<HTMLSelectElement>
  onBlur?: React.FocusEventHandler<HTMLSelectElement>
  options: { value: T; text?: string; disabled?: boolean }[]
  width?: string | number
  height?: string | number
  inputRef?: React.Ref<HTMLSelectElement>
}

export default <T extends Value>({
  onChange,
  onFocus,
  onBlur,
  appearance = 'solid',
  width = '100%',
  height = '100%',
  inputRef,
  invalid = false,
  disabled = false,
  options,
  color = 'neutral',
  colorWeight = 800,
  textColor = 'neutral',
  textColorWeight = 0,
  value,
  defaultValue,
}: SelectProps<T>) => {
  const className = classes(
    inputStyle,
    modify({
      appearance,
      disabled,
      invalid,
      color,
      colorWeight,
      textColor,
      textColorWeight,
    }),
  )

  return (
    <select
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      className={className}
      value={value}
      defaultValue={defaultValue}
      ref={inputRef}
      style={{
        appearance: 'menulist',
        WebkitAppearance: 'menulist',
        width,
        height,
      }}
    >
      {options.map(({ value, text, disabled }, i) => (
        <option key={i} value={value} disabled={disabled}>
          {text || value}
        </option>
      ))}
    </select>
  )
}
