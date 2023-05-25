import React from 'react'
import { Box } from '../Layout'
import * as Colors from '../colors'
import { CustomText, TextProps } from '../text/Text'
import * as Style from './TooltipStyle'
import { getCaretBorderStyleName } from './TooltipStyle'

export type TooltipProps = {
  toolTipRef: React.RefObject<HTMLDivElement>
  position: TooltipPosition
  height: React.CSSProperties['height']
  width?: React.CSSProperties['width']
  message?: string | React.ReactNode
  offset?: number
  textColor?: TextProps['color']
  textColorWeight?: TextProps['colorWeight']
  borderColor?: TextProps['color']
  borderColorWeight?: TextProps['colorWeight']
  backgroundColor?: TextProps['color']
  backgroundColorWeight?: TextProps['colorWeight']
  fontSize?: number
  fontWeight?: number
  showCaret?: boolean
  padding?: string
}

export type TooltipPosition = 'left' | 'right' | 'top' | 'bottom'

const classes = ({ position }: Partial<TooltipProps>): string =>
  [Style.Tooltip, Style.Position[position]].join(' ')

const caretTranslate = (distance: number, position: TooltipPosition) => {
  return position === 'left' || position === 'right'
    ? `translateY(${distance}px)`
    : `translateX(${distance}px)`
}

const Tooltip = ({
  toolTipRef,
  message,
  position,
  borderColor = 'neutral',
  borderColorWeight = 0,
  backgroundColor = 'neutral',
  backgroundColorWeight = 0,
  textColor = 'neutral',
  textColorWeight = 1000,
  fontSize = 12,
  fontWeight = 400,
  height = 'auto',
  width = 'auto',
  offset = 0,
  showCaret = true,
  padding = '8px 12px',
}: TooltipProps) => {
  const caretStyle = {
    transform: caretTranslate(offset, position),
    ...(borderColor && {
      [getCaretBorderStyleName(position)]:
        Colors[borderColor](borderColorWeight),
    }),
  }

  const bodyStyle = {
    alignItems: 'center',
    borderColor: Colors[borderColor](borderColorWeight),
    backgroundColor: Colors[backgroundColor](backgroundColorWeight),
    padding: padding,
  }

  return (
    <Box
      height={height}
      maxWidth={width}
      minWidth="fit-content"
      tag="div"
      className={classes({ position })}
    >
      <div className={Style.TooltipContent} ref={toolTipRef}>
        {showCaret && <div className={Style.TooltipCaret} style={caretStyle} />}
        <Box className={Style.TooltipBody} style={bodyStyle}>
          <Box style={{ width: 'auto' }}>
            {typeof message === 'string' ? (
              <CustomText
                color={textColor}
                colorWeight={textColorWeight}
                fontSize={fontSize}
                lineHeight={1.2}
                text={message}
                fontWeight={fontWeight}
              />
            ) : (
              message
            )}
          </Box>
        </Box>
      </div>
    </Box>
  )
}

export default Tooltip
