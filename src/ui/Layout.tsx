import * as RM from '@rainmaker/ui'
import { omitBy, pick } from 'lodash'
import React from 'react'
import { style as _style, classes } from 'typestyle'
import { NestedCSSProperties } from 'typestyle/lib/types'
import { ItemFactory } from './registry'

type CSSProperties = NestedCSSProperties | React.CSSProperties

type ElementFields = Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'style'
>

type CustomFields = {
  hover?: CSSProperties
  active?: CSSProperties
  className?: string
  tooltip?: string
  link?: string
  hidden?: boolean
  inline?: boolean
  forwardedRef?: any
  tag?: keyof HTMLElementTagNameMap
}

type BoxFields = ElementFields &
  BoxStyleFields &
  CustomFields & {
    style?: CSSProperties
  }

// A list of styles which may be applied directly to a Box component as fields
const boxStyleFields = [
  'alignItems',
  'alignContent',
  'alignSelf',
  'justifyContent',
  'justifySelf',
  'flex',
  'flexBasis',
  'flexDirection',
  'flexFlow',
  'flexGrow',
  'flexShrink',
  'flexWrap',
  'gap',
  'width',
  'maxWidth',
  'minWidth',
  'height',
  'maxHeight',
  'minHeight',
  'margin',
  'marginTop',
  'marginLeft',
  'marginRight',
  'marginBottom',
  'padding',
  'paddingTop',
  'paddingLeft',
  'paddingRight',
  'paddingBottom',
  'fontSize',
  'opacity',
  'position',
  'background',
  'cursor',
] satisfies Exclude<
  keyof React.CSSProperties,
  keyof CustomFields | keyof ElementFields
>[]

type BoxStyleField = (typeof boxStyleFields)[number]
type BoxStyleFields = Pick<React.CSSProperties, BoxStyleField>

const rowStyle: CSSProperties = {
  flexDirection: 'row',
  alignItems: 'center',
}

const columnStyle: CSSProperties = {
  flexDirection: 'column',
  alignItems: 'stretch',
}

// Create a Box with default properties
export const createBox = (defaultStyle: CSSProperties) => {
  return wrapBox(Box, defaultStyle)
}

// Wrap a component, extending it with Box style functionality.
//  Root-level properties that are not "style" will be passed to the wrapper.
export const wrapBox = <T extends React.FunctionComponent>(
  Component: T,
  defaultStyle: CSSProperties = {},
) => {
  return ({
    style = {},
    fields = {},
    ...props
  }: {
    style?: CSSProperties
    fields?: BoxFields
  } & (Parameters<T>[0] extends undefined ? {} : Parameters<T>[0]) &
    BoxStyleFields) => {
    const { attributes, styles } = parseFields(props)

    return (
      <Box
        {...fields}
        style={
          {
            ...style,
            ...styles,
            ...(defaultStyle ?? {}),
          } as React.CSSProperties
        }
      >
        {/* @ts-ignore */}
        <Component {...{ ...(props as T), ...attributes }} />
      </Box>
    )
  }
}

export const WrapBox = <T extends React.FunctionComponent>({
  C,
  children,
  style = {},
  fields = {},
  ...props
}: {
  C: T
  children?: React.ReactNode
  style?: CSSProperties
  fields?: BoxFields
} & (Parameters<T>[0] extends undefined ? {} : Parameters<T>[0]) &
  BoxStyleFields) => {
  const Component = wrapBox(C)
  return (
    <Component style={style} fields={fields} {...props}>
      {children}
    </Component>
  )
}

type BoxProps = BoxFields & {
  children?: React.ReactNode
}

export const Box = ({
  children,
  className,
  style = {},
  hover,
  active,
  tooltip,
  link,
  hidden,
  inline,
  tag,
  forwardedRef,
  ...fields
}: BoxProps) => {
  const { attributes, styles } = parseFields(fields)

  const Tag = tag ?? (link ? 'a' : 'div')
  const content = (
    <Tag
      // @ts-ignore
      className={classes(
        className,
        // @ts-ignore
        _style({
          ...style,
          ...styles,
          $nest: {
            ...((style as NestedCSSProperties).$nest || {}),
            '&:hover': hover,
            '&:active': active,
          },
        }),
      )}
      ref={forwardedRef}
      style={{
        display: hidden ? 'none' : inline ? 'inline-flex' : 'flex',
      }}
      {...(link
        ? {
            target: '_blank',
            href: link,
          }
        : {})}
      {...attributes}
    >
      {children}
    </Tag>
  )

  return tooltip ? (
    <RM.Tooltip message={tooltip} position="top" variant="detailed">
      {content}
    </RM.Tooltip>
  ) : (
    content
  )
}

export const Row = ({
  children,
  className,
  style = {},
  ...fields
}: BoxProps) => {
  return (
    <Box
      className={className}
      {...fields}
      style={
        {
          ...rowStyle,
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </Box>
  )
}

export const Column = ({
  children,
  className,
  style = {},
  ...fields
}: BoxProps) => {
  return (
    <Box
      className={className}
      {...fields}
      style={
        {
          ...columnStyle,
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </Box>
  )
}

const parseFields = (fields: BoxFields) => {
  const styles = pick(fields, boxStyleFields)

  return {
    attributes: omitBy(
      fields,
      (_: any, key: string) =>
        key === 'style' || boxStyleFields.includes(key as any),
    ),
    styles,
  }
}
