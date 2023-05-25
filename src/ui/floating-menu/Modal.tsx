import * as React from 'react'
import { style } from 'typestyle'
import { Box, IconButton, Color, Modal, Heading1 } from '..'
import { subscribeToEscape } from '../../utils/escape-context'
import bowser from 'bowser'

const browser = bowser.getParser(navigator.userAgent)

const shadowBackgroundClass = style({
  position: 'absolute',
  height: '100%',
  width: '100%',
  ...(browser.isBrowser('chrome')
    ? {
        background: Color.color(Color.neutral(1000)).fade(0.2).toString(),
        backdropFilter: 'blur(20px)',
      }
    : {
        background: Color.color(Color.neutral(900)).fade(0.4).toString(),
      }),
})

const modalNoBackground = style({
  pointerEvents: 'none',
})

export const modalHeading = style({
  padding: '36px 60px 20px 20px',
  background: `linear-gradient(81.54deg, ${Color.red.normal} -2.18%, ${Color.blue.normal} 102.46%)`,
  backgroundSize: 'cover',
  backgroundPosition: 'bottom',
  color: Color.neutral(0),
})
export const modalContent = style({
  fontWeight: 400,
  fontSize: 14,
})

const closeButton = style({
  position: 'absolute',
  top: 8,
  right: 8,
})

const modal = style({
  position: 'relative',
  background: Color.neutral(0),
  color: Color.neutral(1000),
  borderRadius: 12,
  overflow: 'hidden',
})

const MODAL_GUTTER_SIZE = 13

const topLeft = style({
  position: 'fixed',
  background: Color.neutral(0),
  color: Color.neutral(1000),
  borderRadius: 12,
  overflow: 'hidden',
  top: MODAL_GUTTER_SIZE,
  left: MODAL_GUTTER_SIZE,
})

const bottomLeft = style({
  position: 'fixed',
  background: Color.neutral(0),
  color: Color.neutral(1000),
  borderRadius: 12,
  overflow: 'hidden',
  bottom: MODAL_GUTTER_SIZE,
  left: MODAL_GUTTER_SIZE,
})

const topRight = style({
  position: 'fixed',
  background: Color.neutral(0),
  color: Color.neutral(1000),
  borderRadius: 12,
  overflow: 'hidden',
  top: MODAL_GUTTER_SIZE,
  right: MODAL_GUTTER_SIZE,
})

const bottomRight = style({
  position: 'fixed',
  background: Color.neutral(0),
  color: Color.neutral(1000),
  borderRadius: 12,
  overflow: 'hidden',
  bottom: MODAL_GUTTER_SIZE,
  right: MODAL_GUTTER_SIZE,
})

const bottomCenter = style({
  position: 'fixed',
  background: Color.neutral(0),
  color: Color.neutral(1000),
  borderRadius: 12,
  overflow: 'hidden',
  bottom: MODAL_GUTTER_SIZE,
})

const topCenter = style({
  position: 'fixed',
  background: Color.neutral(0),
  color: Color.neutral(1000),
  borderRadius: 12,
  overflow: 'hidden',
  top: MODAL_GUTTER_SIZE,
})

export const enum ModalPosition {
  TopCenter = 'top-center',
  BottomCenter = 'bottom-center',
  TopLeft = 'top-left',
  BottomLeft = 'bottom-left',
  TopRight = 'top-right',
  BottomRight = 'bottom-right',
}

const modalPosition = (corner?: ModalPosition) => {
  switch (corner) {
    case ModalPosition.TopCenter:
      return topCenter
    case ModalPosition.BottomCenter:
      return bottomCenter
    case ModalPosition.TopLeft:
      return topLeft
    case ModalPosition.BottomLeft:
      return bottomLeft
    case ModalPosition.TopRight:
      return topRight
    case ModalPosition.BottomRight:
      return bottomRight
    default:
      return modal
  }
}

export const BasicModal = React.memo(
  (
    props: React.PropsWithChildren<{
      headline?: string
      /** probably just going to be setIsOpen(false) */
      onClose(): void
      maxWidth?: number
      isOpen: boolean
      shadowBackground?: boolean
      /**
       * If left undefined, modal will render in center of page.
       * @default undefined
       */
      position?: ModalPosition
      closeable?: boolean
      showX?: boolean
      backgroundColor?: string
      textColor?: string
    }>,
  ) => {
    const {
      shadowBackground = true,
      closeable = true,
      showX = false,
      backgroundColor = Color.neutral(800),
      textColor = Color.neutral(0),
    } = props
    React.useEffect(() => {
      if (closeable && props.isOpen) {
        return subscribeToEscape(() => {
          props.onClose()
        })
      }
    }, [props.isOpen])
    return (
      <Modal
        top="0%"
        isOpen={props.isOpen}
        onClose={() => {
          props.onClose()
        }}
      >
        <Box
          alignItems="center"
          justifyContent="center"
          {...(shadowBackground && {
            height: '100vh',
            width: '100vw',
          })}
        >
          {shadowBackground && (
            <Box
              className={shadowBackgroundClass}
              onClick={(e) => {
                e.stopPropagation()
                props.onClose()
              }}
            />
          )}
          <Box
            onClick={(e) => {
              e.stopPropagation()
            }}
            className={modalPosition(props.position)}
            maxWidth={props.maxWidth}
          >
            {closeable && showX && (
              <IconButton
                className={closeButton}
                color="neutral"
                colorWeight={400}
                fontSize={24}
                icon="Close"
                onClick={props.onClose}
              />
            )}
            {props.headline && (
              <Box className={modalHeading}>
                <Heading1 text={props.headline} />
              </Box>
            )}
            <Box
              className={modalContent}
              style={{ backgroundColor, color: textColor }}
            >
              {props.children}
            </Box>
          </Box>
        </Box>
      </Modal>
    )
  },
)
