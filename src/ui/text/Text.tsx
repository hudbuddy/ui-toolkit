import React from 'react'
import * as Color from '../colors'
import { Icon, IconName } from '../icons/Icon'

const ELLIPSIS_RULES: React.CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'inline-block',
  lineHeight: 1.2, // Adds a buffer so hanging letters like "g" don't get cut off
}

const styles = (
  props: Partial<TextProps> | TextBuilderProps,
): React.CSSProperties => {
  let {
    selectable = true,
    cursor,
    paragraph,
    fontSize,
    fontWeight,
    color,
    colorWeight = 0,
    textTransform,
    textAlign,
    letterSpacing,
    opacity,
    italic,
    bold,
    width,
    maxWidth,
    ellipsis,
    marginLeft,
    marginTop,
    muted,
    selectOnClick,
  } = props

  if (muted) {
    color = color ?? 'neutral'
    colorWeight = colorWeight + 400
  }

  return {
    width,
    ...(maxWidth ? { maxWidth, display: 'inline-block' } : {}),
    ...(paragraph ? { lineHeight: 1.4 } : {}),
    fontSize,
    fontWeight: bold ? '700' : fontWeight,
    color: color ? Color[color](colorWeight) : null,
    cursor,
    opacity,
    marginLeft,
    marginTop,
    textTransform,
    textAlign,
    letterSpacing: letterSpacing,
    fontStyle: italic ? 'italic' : 'inherit',
    flexWrap: 'wrap',
    userSelect: selectOnClick ? 'all' : selectable ? 'text' : 'none',
    display: 'inline-flex',
    lineHeight: getLineHeight(props),
    ...(ellipsis ? ELLIPSIS_RULES : {}),
  }
}

const getLineHeight = (props: Partial<TextProps> | TextBuilderProps) => {
  if (props.lineHeight) return props.lineHeight
  if (props.ellipsis) return ELLIPSIS_RULES.lineHeight
  if (props.paragraph) return '1.4em'
  return '1.1em'
}

export type TextProps = {
  text: string | number
  tagName?: 'div' | 'span'
  paragraph?: boolean
  fontWeight?: number
  color?: Color.Type
  colorWeight?: number
  fontSize?: number
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none'
  textAlign?: 'left' | 'right' | 'center'
  italic?: boolean
  bold?: boolean
  selectable?: boolean
  letterSpacing?: number | string
  lineHeight?: number | string
  opacity?: number
  width?: number
  maxWidth?: number
  marginLeft?: number | string
  marginTop?: number | string
  ellipsis?: boolean
  icon?: IconName
  iconColorWeight?: number
  iconScale?: number
  iconMargin?: string | number
  muted?: boolean
  selectOnClick?: boolean
  href?: string
  cursor?: 'pointer' | 'default'
  iconColor?: Color.Type
  // Avoid style overrides
  style?: React.CSSProperties
}

type TextFragment =
  | [] // Line break
  | [string] // Text only
  | [string, Omit<TextProps, 'text'>] // Text with custom styles
  | [Omit<TextProps, 'text'> & { text?: string }] // Optional text/icon
export type TextBuilderProps = Omit<TextProps, 'text'> & {
  text: Array<TextFragment>
  insertSpaces?: boolean
}
export const TextBuilder = (props: TextBuilderProps) => (
  <div
    style={{
      ...styles(props),
    }}
  >
    {props.text.map(([textOrModifiers, modifiers = {}], i) => {
      const { insertSpaces = true } = props
      let text = textOrModifiers
      if (typeof textOrModifiers === 'object') {
        modifiers = textOrModifiers
        text = textOrModifiers.text
      }

      return typeof textOrModifiers === 'string' ||
        typeof textOrModifiers === 'object' ? (
        <span
          key={i}
          style={{
            ...styles(modifiers),
            marginRight: insertSpaces ? '0.25em' : '0',
          }}
        >
          <>
            {modifiers.icon && (
              <TextIcon {...modifiers} withMargin={Boolean(text)}></TextIcon>
            )}
            {modifiers.href ? (
              <span style={{ display: 'inline' }}>
                <a
                  style={{
                    color: 'inherit',
                    background: 'inherit',
                    fontSize: 'inherit',
                    opacity: 'inherit',
                    position: 'relative',
                    textDecoration: 'none',
                    display: 'inline',
                  }}
                  target="_blank"
                  href={modifiers.href}
                >
                  {text as string}
                </a>
              </span>
            ) : (
              text
            )}
          </>
        </span>
      ) : (
        <br key={i} />
      )
    })}
  </div>
)

const TextIcon = (props: Omit<TextProps, 'text'> & { withMargin: boolean }) => {
  const iconScale = props.iconScale || 1.5
  const margin =
    typeof props.iconMargin !== 'undefined' ? props.iconMargin : '0.2em'

  return (
    <>
      <span
        style={{
          display: 'inline-block',
          marginRight: props.withMargin ? margin : 0,
          width: `${iconScale}em`,
          height: getLineHeight(props),
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            fontSize: `${iconScale}em`,
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <Icon
            name={props.icon}
            color={props.iconColor}
            colorWeight={props.iconColorWeight}
          />
        </span>
      </span>
    </>
  )
}

const isUppercase = (props: TextProps) => props.textTransform === 'uppercase'

export const CustomText = (props: TextProps) => {
  const Tag = props.href ? 'a' : props.tagName || 'div'
  props = {
    ...props,
    lineHeight:
      typeof props.lineHeight === 'number'
        ? `${props.lineHeight}em`
        : props.lineHeight,
  }

  return (
    <Tag
      style={{ ...styles(props), textDecoration: 'none', ...props.style }}
      {...(props.href && {
        target: '_blank',
        href: props.href,
      })}
    >
      {props.icon && (
        <TextIcon {...props} withMargin={Boolean(props.text)}></TextIcon>
      )}
      {props.text}
    </Tag>
  )
}

export const Heading1 = (props: TextProps) => {
  return <CustomText fontSize={24} italic={false} fontWeight={900} {...props} />
}

export const Heading2 = (props: TextProps) => {
  return (
    <CustomText fontSize={20} lineHeight={1.1} fontWeight={700} {...props} />
  )
}

export const Heading3 = (props: TextProps) => {
  return (
    <CustomText fontSize={16} lineHeight={1.2} fontWeight={700} {...props} />
  )
}

export const Body = (props: TextProps) => {
  return (
    <CustomText
      fontSize={12}
      lineHeight={1.2}
      fontWeight={isUppercase(props) ? 500 : 400}
      {...props}
    />
  )
}

// Used for inline links where button-based Link is not desirable
export const Link = (
  props: TextProps & { textStyle?: keyof typeof TextStyles },
) => {
  const Component = TextStyles[props.textStyle] || CustomText

  return (
    <Component
      bold={true}
      text={props.text || props.href}
      color="primary"
      colorWeight={500}
      {...props}
    />
  )
}

export const Label = (props: TextProps) => {
  return (
    <CustomText
      fontSize={13}
      lineHeight={1}
      fontWeight={400}
      color="neutral"
      colorWeight={400}
      ellipsis={true}
      {...props}
    />
  )
}

export const Warning = (
  props: TextProps & { textStyle?: keyof typeof TextStyles },
) => {
  const Component = TextStyles[props.textStyle] || Body

  return (
    <Component
      icon="Warning"
      iconColor="warning"
      fontSize={12}
      iconScale={1.7}
      color="neutral"
      colorWeight={0}
      {...props}
    />
  )
}

// Alias
export const TextItem = Body

export const TextStyles = {
  Heading1,
  Heading2,
  Heading3,
  Body,
  Label,
  CustomText,
}
