import { Box, Row, wrapBox } from '../Layout'
import * as Color from '../colors'
import { Icon, IconName } from './Icon'

type IconDefinition = {
  icon: IconName
  color: Color.ColorHelper
  display: string
  iconScale: number
}

type IconDictionary = { [name: string]: IconDefinition }

const rtmp = {
  icon: 'RTMP',
  color: Color.rtmp,
  display: 'Custom RTMP',
  iconScale: 0.8,
} as IconDefinition

const platformData = {
  twitchtv: {
    icon: 'Twitch',
    color: Color.twitch,
    display: 'Twitch',
    iconScale: 0.95,
  },
  facebook: {
    icon: 'Facebook',
    color: Color.facebook,
    display: 'Facebook',
    iconScale: 0.8,
  },
  youtube: {
    icon: 'YouTube',
    color: Color.youtube,
    display: 'YouTube',
    iconScale: 0.9,
  },
  magic: {
    icon: 'MagicLink',
    color: Color.magic,
    display: 'Magic Link',
    iconScale: 0.9,
  },
  xbox: { icon: 'Xbox', color: Color.xbox, display: 'Xbox', iconScale: 0.9 },
  rtmp,
  custom: rtmp, // Alias
  // TODO: Include JOBY icons as needed
} satisfies IconDictionary

type BrandName = keyof typeof platformData

type Props = {
  name: BrandName
  size?: number
}
export const BrandBubble = wrapBox(({ name, size = 34 }: Props) => {
  const data = platformData[name]
  if (!data) return null

  return (
    <Box
      tooltip={data.display}
      alignItems="center"
      justifyContent="center"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: data.color.toString(),
      }}
    >
      <Icon size={data.iconScale * 100 + '%'} name={data.icon} />
    </Box>
  )
})

export const BrandBubbleList = wrapBox(
  ({ names = [], size = 34 }: { names: BrandName[]; size?: number }) => {
    const margin = -size / 5

    return (
      <Row paddingRight={-margin}>
        {names
          .filter((x) => Boolean(platformData[x]))
          .map((x, i) => (
            <BrandBubble
              key={i}
              size={size}
              name={x}
              style={{
                marginRight: margin,
                border: '1px solid #111',
                borderRadius: '50%',
              }}
            />
          ))}
      </Row>
    )
  },
)
