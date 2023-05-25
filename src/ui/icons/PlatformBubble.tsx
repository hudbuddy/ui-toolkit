import { Box, Row, wrapBox } from '../Layout'
import * as Color from '../colors'
import { Icon, IconName } from './Icon'

type IconDefinition = {
  icon: IconName
  color: Color.ColorHelper
  display: string
}

type IconDictionary = { [name: string]: IconDefinition }

const platformData: IconDictionary = {
  twitchtv: { icon: 'Twitch', color: Color.twitch, display: 'Twitch' },
  facebook: { icon: 'Facebook', color: Color.facebook, display: 'Facebook' },
  youtube: { icon: 'YouTube', color: Color.youtube, display: 'YouTube' },
  rtmp: { icon: 'RTMP', color: Color.rtmp, display: 'Custom RTMP' },
  magic: { icon: 'MagicLink', color: Color.magic, display: 'Magic Link' },
  // TODO: Include JOBY icons as needed
}
type PlatformName = keyof typeof platformData

// Alias
platformData.custom = platformData.rtmp

type Props = {
  // TODO: PlatformName
  type: string
  size?: number
}
export const PlatformBubble = wrapBox(({ type, size = 34 }: Props) => {
  const data = platformData[type]
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
      <Icon
        height={type === 'rtmp' ? '73%' : '84%'}
        width={type === 'rtmp' ? '73%' : '84%'}
        name={data.icon}
      />
    </Box>
  )
})

export const PlatformBubbleList = wrapBox(
  ({ platforms, size = 34 }: { platforms: string[]; size?: number }) => {
    const margin = -size / 5

    return (
      <Row paddingRight={-margin}>
        {platforms
          .filter((x) => Boolean(platformData[x]))
          .map((x, i) => (
            <PlatformBubble
              key={i}
              size={size}
              type={x}
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
