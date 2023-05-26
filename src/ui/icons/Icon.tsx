import { CSSProperties } from 'react'
import { Box, wrapBox } from '../Layout'
import * as IconMap from './IconMap'
import * as FaIconLight from '@fortawesome/pro-light-svg-icons'
import * as FaIconRegular from '@fortawesome/pro-regular-svg-icons'
import * as FaIconSolid from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Color from '../colors'

export type IconName = keyof typeof IconMap | FaIconName

const customIcons = Object.keys(IconMap)

const nudge = (props: Partial<IconProps>): CSSProperties => {
  if (
    !(props.nudgeUp || props.nudgeDown || props.nudgeRight || props.nudgeLeft)
  )
    return

  return {
    position: 'relative',
    top: props.nudgeDown,
    left: props.nudgeRight,
    right: props.nudgeLeft,
    bottom: props.nudgeUp,
  }
}

type Props = {
  // An icon will inherit its container's color unless specified
  color?: Color.Type
  colorWeight?: number

  width?: number | string
  height?: number | string

  // Shorthand for width/height
  size?: number | string

  marginLeft?: number
  marginTop?: number

  nudgeUp?: number | string
  nudgeDown?: number | string
  nudgeLeft?: number | string
  nudgeRight?: number | string
}

const SVGWrapper = ({
  children,
  color,
  colorWeight,
  width,
  height,
  size,
  marginLeft,
  marginTop,
  ...props
}: Props & { children: JSX.Element }) => {
  let colorStyle = 'inherit'
  if (color) {
    colorStyle = Color[color](colorWeight)
  }

  return (
    <Box
      style={{
        ...nudge(props),
        display: 'flex',
        justifyContent: 'center',
        flexBasis: width || size || 'auto',
        flexShrink: 0,
        width: width || size || '1em',
        height: height || (width || size ? 'fit-content' : '1em'),
        fill: 'currentColor',
        color: colorStyle,
        marginLeft,
        marginTop,
      }}
    >
      {children}
    </Box>
  )
}

// {type} property applies only to FontAwesome icons
type IconProps = Props & { name: IconName; type?: FaIconType }
const Icon = ({ name, ...props }: IconProps) => {
  if (!name) return null
  if (customIcons.includes(name)) {
    return <SVGWrapper {...props}>{IconMap[name]}</SVGWrapper>
  } else {
    return <FaIcon {...{ name: name as FaIconName, ...props }} />
  }
}

const faIcons = {
  light: FaIconLight,
  regular: FaIconRegular,
  solid: FaIconSolid,
}
export type FaIconName = keyof typeof FaIconRegular
export type FaIconType = keyof typeof faIcons

type FaIconProps = Props & {
  name: FaIconName
  type?: keyof typeof faIcons
}
const FaIcon = ({ name, type = 'regular', ...props }: FaIconProps) => {
  return (
    <SVGWrapper {...props}>
      <FontAwesomeIcon
        icon={faIcons[type][name]}
        style={{
          padding: '16%',
          height: props.height || props.size,
          width: props.width || props.size,
        }}
      />
    </SVGWrapper>
  )
}

type SVGProps = Props & { svg: JSX.Element }
const SVG = ({ svg, ...props }: SVGProps) => {
  return <SVGWrapper {...props}>{svg}</SVGWrapper>
}

export { Icon, FaIcon, SVG }
