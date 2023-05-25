import { color, ColorHelper } from 'csx'
export { ColorHelper }

export { color }

// Alias color helper for named import (e.g. Color.of())
export const of = color

// Account types
export const lightstream = color('#26ad80')
export const twitch = color('#9047fb')
export const youtube = color('#e52d27')
export const facebook = color('#1877f2')
export const mixer = color('#0075d5')
export const magic = color('#6851FF')
export const rtmp = color('#333333')

// Aliases
export const beam = mixer
export const twitchtv = twitch

export const transparent = color('rgba(0,0,0,0)')
export const white = color('#ffffff')
export const black = color('#000000')

/**
 * Joby theme colors
 */

const weights = {
  primary: {
    400: '#8de2af',
    500: '#70db9b',
    600: '#31c26b',
  } as const,
  secondary: {
    400: '#ec6365',
    500: '#e73C3e',
    600: '#9b1315',
  } as const,
  neutral: {
    0: '#ffffff',
    100: '#e3e3e8',
    200: '#bfbfca',
    300: '#a6a6b2',
    400: '#8f8f9f',
    500: '#737385',
    600: '#58586e',
    700: '#424255',
    800: '#39394c',
    900: '#2e2e3f',
    1000: '#1c1c27',
  } as const,
  warning: {
    400: '#FCDE78',
    500: '#FBD656',
    600: '#F1BD06',
  },
} as const

export type Type = keyof typeof weights
export const types = Object.keys(weights) as Type[]

const weight =
  (type: keyof typeof weights) =>
  (weight: number): string => {
    const map = weights[type] as any
    if (map[weight]) return map[weight]

    // Find the first available weight greater than or equal to the provided weight
    const availableWeights = Object.keys(weights[type]).map(Number)
    const result = availableWeights.find((x) => weight <= x)

    // Return last color if none matches
    if (typeof result === 'number') {
      return map[result]
    } else {
      return map[availableWeights.slice(availableWeights.length - 1)[0]]
    }
  }

export const primary = weight('primary')
export const neutral = weight('neutral')
export const secondary = weight('secondary')
export const warning = weight('warning')

/**
 * Joby brand colors
 */

export const green = {
  light: '#8de2af',
  normal: '#70db9b',
  dark: '#31c26b',
} as const
export const red = {
  light: '#ec6365',
  normal: '#E73C3e',
  dark: '#9b1315',
} as const
export const blue = {
  light: '#4A44DD',
  normal: '#2b24c5',
  dark: '#201A90',
} as const
export const yellow = {
  light: '#FCDE78',
  normal: '#FBD656',
  dark: '#F1BD06',
} as const
export const pink = {
  light: '#eb81a4',
  normal: '#e6628d',
  dark: '#cf215a',
} as const
export const teal = {
  light: '#5bc9d1',
  normal: '#36b8c2',
  dark: '#28878E',
} as const

/**
 * Third party brand primary colors
 */

export const linkedin = color('#0077B5')
export const twitter = color('#1da1f2')
export const amazon = color('#FF9900')
export const dlive = color('#FFD300')
export const douyu = color('#FF7702')
export const huya = color('#FFA900')
export const tiktok = color('#FF0050')
export const trovo = color('#1BAB78')
export const vimeo = color('#1AB7EA')
export const wowza = color('#FF883C')
