import { style } from 'typestyle'
import { neutral } from '../colors'

const modifier = (debugName?: string) =>
  style({ $debugName: debugName, content: `"${Math.random()}"` })

/**
 * Define parameters that can be tweaked
 */
const HIGHLIGHT_WIDTH = 5
const CARET_SIZE = 7
const BORDER_RADIUS = 4
const PADDING_SIDE = 12
const PADDING_VERTICAL = 8
const DARK_BACKGROUND_COLORS = {
  simple: '#323437',
  default: '#07090c',
  success: '#07090c',
  alert: '#07090c',
  error: '#07090c',
}
const BACKGROUND_COLORS = {
  simple: neutral(900),
  default: neutral(900),
  success: neutral(900),
  alert: neutral(900),
  error: neutral(900),
}

const HIGHLIGHT_COLORS = {
  simple: neutral(900),
  default: '#535558',
  success: '#26ad80',
  alert: '#fba74e',
  error: '#e95549',
}

/**
 * Define modifiers
 */

// Kind
const Tooltip_simple = modifier('simple')
const Tooltip_success = modifier('success')
const Tooltip_alert = modifier('alert')
const Tooltip_default = modifier('default')
const Tooltip_error = modifier('error')
export const Kind = {
  simple: Tooltip_simple,
  success: Tooltip_success,
  alert: Tooltip_alert,
  default: Tooltip_default,
  error: Tooltip_error,
}

// Position
const Tooltip_left = modifier('left')
const Tooltip_right = modifier('right')
const Tooltip_top = modifier('top')
const Tooltip_bottom = modifier('bottom')
export const Position = {
  left: Tooltip_left,
  right: Tooltip_right,
  top: Tooltip_top,
  bottom: Tooltip_bottom,
}

/**
 * Define the styles for each
 */

export const TooltipCaret = style({
  width: 0,
  height: 0,
  borderTopWidth: CARET_SIZE,
  borderBottomWidth: CARET_SIZE,
  borderLeftWidth: CARET_SIZE,
  borderRightWidth: CARET_SIZE,
  borderColor: 'transparent',
  borderStyle: 'solid',
  display: 'block',
  position: 'absolute',
})

export const TooltipContent = style({
  width: '100%',
  height: '100%',
  position: 'relative',
  borderRadius: BORDER_RADIUS,
  pointerEvents: 'auto',
  $nest: {
    '&:hover': {
      visibility: 'visible',
      opacity: '1',
    },
  },
})

export const TooltipBody = style({
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  padding: `${PADDING_VERTICAL}px ${PADDING_SIDE}px`,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: BORDER_RADIUS,
  borderWidth: '1px',
  borderStyle: 'solid',
  position: 'relative',
  overflow: 'hidden',
  justifyContent: 'space-evenly',
  $nest: {
    ['&:after']: {
      content: `""`,
      position: 'absolute',
    },
  },
})

export const TooltipHeader = style({
  position: 'relative',
  marginBottom: 6,
})

/**
 * Define the styles that rely on modifiers
 */

const getAlignment = (position: string) => {
  if (position === 'top' || position === 'bottom') {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  }
  return {}
}
const getHighlightPadding = (position: string) => {
  switch (position) {
    case 'left':
      return { paddingRight: PADDING_SIDE + HIGHLIGHT_WIDTH }
    case 'right':
      return { paddingLeft: PADDING_SIDE + HIGHLIGHT_WIDTH }
    case 'top':
      return { paddingBottom: PADDING_VERTICAL + HIGHLIGHT_WIDTH }
    case 'bottom':
      return { paddingTop: PADDING_VERTICAL + HIGHLIGHT_WIDTH }
  }
}

const getCaretPosition = (position: string) => {
  switch (position) {
    case 'left':
      return {
        left: '100%',
        top: '50%',
      }
    case 'right':
      return {
        right: '100%',
        top: '50%',
      }
    case 'bottom':
      return {
        left: '50%',
        bottom: '100%',
      }
    case 'top':
      return {
        left: '50%',
        top: '100%',
      }
  }
}
const getCaretMargin = (position: string) => {
  switch (position) {
    case 'left':
      return `-${CARET_SIZE}px -1px`
    case 'right':
      return `-${CARET_SIZE}px -1px`
    case 'bottom':
      return `-1px -${CARET_SIZE}px`
    case 'top':
      return `-1px -${CARET_SIZE}px`
  }
}
export const getCaretBorderStyleName = (position: string) => {
  switch (position) {
    case 'left':
      return `borderLeftColor`
    case 'right':
      return `borderRightColor`
    case 'bottom':
      return `borderBottomColor`
    case 'top':
      return `borderTopColor`
  }
}

const forPositionAndKind = (
  position: keyof typeof Position,
  kind: keyof typeof Kind,
) => ({
  $nest: {
    [`& .${TooltipBody}`]: {
      backgroundColor: BACKGROUND_COLORS[kind],
      color: HIGHLIGHT_COLORS[kind],
      border: `1px solid ${HIGHLIGHT_COLORS[kind]}`,
      ...(kind !== 'simple'
        ? getHighlightPadding(position)
        : {
            padding: '6px 8px',
          }),
    },
    [`& .${TooltipBody}:after`]: {
      bottom: position === 'bottom' ? 'auto' : 0,
      left: position === 'left' ? 'auto' : 0,
      right: position === 'right' ? 'auto' : 0,
      top: position === 'top' ? 'auto' : 0,
      height:
        position === 'bottom' || position === 'top' ? HIGHLIGHT_WIDTH : '100%',
      width:
        position === 'right' || position === 'left' ? HIGHLIGHT_WIDTH : '100%',
      background: 'currentColor',
    },
    [`& .${TooltipCaret}`]: {
      [getCaretBorderStyleName(position)]: HIGHLIGHT_COLORS[kind],
    },
  },
})

const forPosition = (position: keyof typeof Position) => ({
  $nest: {
    [`& .${TooltipBody}`]: {
      ...getAlignment(position),
    },
    [`& .${TooltipCaret}`]: {
      margin: getCaretMargin(position),
      ...getCaretPosition(position),
    },
    [`&.${Kind['simple']}`]: forPositionAndKind(position, 'simple'),
    [`&.${Kind['default']}`]: forPositionAndKind(position, 'default'),
    [`&.${Kind['success']}`]: forPositionAndKind(position, 'success'),
    [`&.${Kind['alert']}`]: forPositionAndKind(position, 'alert'),
    [`&.${Kind['error']}`]: forPositionAndKind(position, 'error'),
  },
})

export const Tooltip = style({
  position: 'relative',
  pointerEvents: 'none',
  whiteSpace: 'normal',
  $nest: {
    // Left
    [`&.${Position['left']}`]: forPosition('left'),
    // Top
    [`&.${Position['top']}`]: forPosition('top'),
    // Right
    [`&.${Position['right']}`]: forPosition('right'),
    // Bottom
    [`&.${Position['bottom']}`]: forPosition('bottom'),
  },
})
