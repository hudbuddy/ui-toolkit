import { useState, useEffect, ReactElement, useCallback } from 'react'
import * as Color from '../colors'
import { stylesheet, style, classes } from 'typestyle'
import { Icon } from '../icons/Icon'
import Select from './Select'
import useElementFromRef from '../hooks/useElementFromRef'
import useEventListener from '../hooks/useEventListener'
import useResizeObserver from '../hooks/useResizeObserver'
import { WithMenu } from '../floating-menu/FloatingMenu'
import { Box, Column } from '../Layout'
import { subscribeToEscape } from '../../utils/escape-context'
import { Body, Label } from '../text/Text'

const important = (x: string) => `${x} !important`

const styles = stylesheet({
  dropdown: {
    borderRadius: 4,
    cursor: 'default',
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    $nest: {
      '& svg': {
        color: 'white',
        opacity: 0.8,
      },
      '&:hover svg': {
        opacity: 1,
      },
      '&:hover': {
        opacity: 1,
      },
    },
  },
  option: {
    cursor: 'default',
    color: Color.white.toString(),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    borderRadius: 4,
  },
})

const DefaultOptionNode = (
  props: DropdownOptionProps<any> & { view: 'list' | 'label' | 'main' },
) => {
  const colorWeight = props.view === 'label' ? 500 : props.disabled ? 600 : 0
  const Component = props.view === 'label' ? Label : Body

  return (
    <Box padding={8} alignItems="center">
      <Component
        text={props.label || props.value}
        color="neutral"
        colorWeight={colorWeight}
        selectable={false}
      />
    </Box>
  )
}

const useForceUpdate = () => {
  const [_, setValue] = useState(0)
  return () => setValue((value) => value + 1)
}

type DropdownOptionProps<T> = {
  value: T
  disabled?: boolean
  label?: string
  // Any additional fields are passed to the OptionNode component
  [prop: string]: unknown
}
type Options<T> = Array<DropdownOptionProps<T>>
type OptionGroups<T> = { [label: string]: Options<T> }
export type DropdownProps<T> = {
  onChange: (val: T) => void
  options: Options<T> | OptionGroups<T>
  value: T
  width?: number
  height?: string | number
  marginLeft?: number
  marginTop?: number
  disabled?: boolean
  invalid?: boolean
  appearance?: 'solid' | 'outline'
  color?: Color.Type
  colorWeight?: number
  dropdownColor?: Color.Type
  dropdownColorWeight?: number
  placeholder?: string
  className?: string
  OptionNode?: (
    props: DropdownOptionProps<T> & {
      view: 'main' | 'list' | 'label'
      group?: string
    },
  ) => ReactElement
}
export const CustomSelect = <T extends string | number>(
  props: DropdownProps<T>,
) => {
  const {
    options,
    value,
    width,
    marginLeft,
    marginTop,
    className,
    color = 'neutral',
    colorWeight = 800,
    dropdownColor,
    dropdownColorWeight = 400,
    disabled = false,
    invalid = false,
    appearance = 'solid',
    placeholder = 'Select an option...',
    onChange,
    OptionNode = DefaultOptionNode,
  } = props
  const allOptions = Array.isArray(options)
    ? options
    : Object.entries(options).flatMap(([group, val]) =>
        val.map((x) => ({ ...x, group })),
      )
  const [activeOption, setActiveOption] = useState(
    allOptions.find((x) => x.value === value),
  )
  const [hoveredValue, setHoveredValue] = useState(null)
  const [dropdownRectWidth, setDropdownRectWidth] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [baseRef, baseEl] = useElementFromRef<HTMLSelectElement>()
  const [inputRef, inputEl] = useElementFromRef<HTMLSelectElement>()
  const [dropdownRef, dropdownEl] = useElementFromRef<HTMLDivElement>()
  const height = props.height || 48
  const forceUpdate = useForceUpdate()

  const isFocused = Boolean(baseEl?.matches(':focus-within, :focus'))

  const colors = {
    base: Color[color](colorWeight),
    error: Color.secondary(400),
  }

  useResizeObserver([dropdownEl], ([rect]) => {
    setDropdownRectWidth(rect.width)
  })
  useEffect(() => {
    setActiveOption(allOptions.find((x) => x.value === value))
  }, [value, options])
  useEffect(() => {
    setHoveredValue(null)
  }, [value])

  // Indicate to the parent that the dropdown believes it should close
  useEventListener(
    document.body,
    'keydown',
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        setIsOpen(!isOpen)
      }
    },
    {},
    [isFocused],
  )

  useEffect(() => {
    if (!isOpen) return
    return subscribeToEscape(() => {
      setIsOpen(false)
    })
  }, [isOpen])

  useEffect(() => {
    if (!isFocused) setIsOpen(false)
  }, [isFocused])

  const renderOptionSet = useCallback(
    (options: Options<T>) =>
      options.map(({ value: optionValue, disabled, ...optionProps }, i) => {
        const style =
          (optionValue === value && !hoveredValue) ||
          (hoveredValue === optionValue && !disabled)
            ? {
                background: Color[color](colorWeight - 200),
                color: Color.white.toString(),
              }
            : { color: Color.white.fade(disabled ? 0.4 : 0.8).toString() }
        return (
          <Box
            width="100%"
            className={styles.option}
            style={style}
            key={optionValue}
            onMouseEnter={() => {
              if (disabled) return
              setHoveredValue(optionValue)
            }}
            onClick={() => {
              if (disabled) return
              onChange(optionValue)
              setIsOpen(false)
            }}
          >
            <OptionNode
              {...optionProps}
              value={optionValue}
              disabled={disabled}
              view="list"
            />
          </Box>
        )
      }),
    [styles, value, hoveredValue, color],
  )

  const renderOptionGroups = (optionGroups: OptionGroups<T>) =>
    Object.entries(optionGroups).map(([k, val]) => (
      <>
        {val.length > 0 && (
          <OptionNode key={k} label={k} value={null} view="label" />
        )}
        {renderOptionSet(val)}
      </>
    ))

  const renderOptions = (options: Options<T> | OptionGroups<T>) => {
    if (Array.isArray(options)) {
      return renderOptionSet(options)
    } else {
      return renderOptionGroups(options)
    }
  }

  return (
    <Box
      forwardedRef={baseRef}
      onBlur={forceUpdate}
      className={classes(
        style({
          border: `1px solid ${colors.base}`,
          backgroundColor: colors.base,
          ...(disabled && {
            pointerEvents: 'none',
            opacity: 0.5,
          }),
          ...(appearance === 'outline' && {
            backgroundColor: Color.transparent.toString(),
          }),
          ...(invalid && {
            borderColor: important(colors.error),
          }),
          $nest: {
            ...(!disabled && {
              '&:hover': {
                ...(appearance === 'solid' && {
                  backgroundColor: colors.base,
                }),
                ...(invalid && {
                  borderColor: important(colors.error),
                }),
              },
              '&:focus, &:focus-within': {
                border: `1px solid ${Color.primary(500)}`,
                ...(invalid && {
                  borderColor: important(colors.error),
                }),
              },
            }),
          },
        }),
        styles.dropdown,
        className,
      )}
      onFocus={(e) => {
        /* It's a hack to prevent the dropdown from closing when the user clicks on the dropdown menu. */
        if (document.activeElement === baseEl) return
        inputEl.focus()
      }}
      padding={0}
      tabIndex={1}
      width={width || '100%'}
      style={{
        height: `${height}px`,
        marginTop,
        marginLeft,
      }}
    >
      <WithMenu
        position="bottom"
        onOutsideClick={
          isOpen
            ? (e) => {
                if (e !== dropdownEl && !dropdownEl.contains(e)) {
                  setIsOpen(false)
                }
              }
            : null
        }
        isOpen={isOpen}
        disabled={disabled}
        containerWidth="100%"
        containerHeight="100%"
        node={
          <div
            onClick={() => {
              setIsOpen(!isOpen)
            }}
            ref={dropdownRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            {/* Active selection */}
            <Box
              width="88%"
              className={styles.option}
              paddingLeft={8}
              paddingRight={8}
            >
              {activeOption ? (
                <OptionNode {...activeOption} view="main" />
              ) : (
                <Box paddingLeft={8} paddingRight={8}>
                  <Body
                    color="neutral"
                    colorWeight={500}
                    selectable={false}
                    text={placeholder}
                  />
                </Box>
              )}
            </Box>
            <div
              style={{
                opacity: isOpen ? 1 : 0.7,
                position: 'absolute',
                right: '0.9em',
              }}
            >
              <Icon
                name="DropdownChevron"
                width={14}
                height={10}
                colorWeight={0}
                color="neutral"
              />
            </div>
          </div>
        }
      >
        {/* Options list */}
        <Column
          width={width || dropdownRectWidth || '100%'}
          maxHeight={350}
          className={classes(styles.dropdown)}
          padding={8}
          style={{
            overflowY: 'auto',
            ...(appearance === 'solid' && {
              background: colors.base,
            }),
            ...(appearance === 'outline' && {
              background: Color.neutral(900),
              border: `1px solid ${colors.base}`,
            }),
            ...(dropdownColor && {
              background:
                Color[dropdownColor || 'neutral'](dropdownColorWeight),
            }),
            fontSize: dropdownEl ? getComputedStyle(dropdownEl).fontSize : 14,
          }}
          onMouseLeave={() => {
            setHoveredValue(value)
          }}
        >
          {renderOptions(options)}
        </Column>
      </WithMenu>
      {/* Offscreen select element */}
      <div
        style={{
          opacity: 0,
          top: 0,
          left: -10000,
          position: 'absolute',
          pointerEvents: 'none',
        }}
      >
        <Select
          {...props}
          value={String(props.value)}
          options={allOptions}
          inputRef={inputRef}
          onChange={(e) => {
            setHoveredValue(null)
            const nextValue = e.target.value
            props.onChange(
              (typeof value === 'string'
                ? String(nextValue)
                : Number(nextValue)) as any,
            )
          }}
        />
      </div>
    </Box>
  )
}

export default CustomSelect
