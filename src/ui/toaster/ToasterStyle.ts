import { cssRaw, keyframes, style, types } from 'typestyle'

export const Placement = {
  topleft: 'topLeft',
  topright: 'topRight',
  bottomleft: 'bottomLeft',
  bottomright: 'bottomRight',
  bottomcenter: 'bottom',
  topcenter: 'top',
}

export const toasterContainer = style({
  position: 'fixed',
  overflow: 'hidden',
  zIndex: 999999999999,
  textAlign: 'right',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 8,
  padding: 1,
})

export const getContainerPosition = (position: string) => {
  switch (position) {
    case Placement.topleft:
      return {
        top: 10,
        left: 10,
      }
    case Placement.topright:
      return {
        top: 10,
        right: 10,
      }
    case Placement.topcenter:
      return {
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
      }
    case Placement.bottomleft:
      return {
        bottom: 10,
        left: 10,
      }
    case Placement.bottomright:
      return {
        bottom: 10,
        right: 10,
      }
    case Placement.bottomcenter:
      return {
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
      }
    default:
      return {
        bottom: 10,
        right: 10,
      }
  }
}

cssRaw(`
    .lightstream-toaster-close {
        cursor: pointer;
        display: flex;
        opacity: 0.7;
    }
    .lightstream-toaster-close:hover {
        cursor: pointer;
        display: flex;
        opacity: 1;
    }
`)

export const toasterContent = style({
  display: 'flex',
  fontFamily: 'Arial',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0 10px',
  whiteSpace: 'pre-line',
  height: '100%',
  background: '#26AD80',
  borderRadius: 100,
  flex: 'none',
  order: 0,
  flexGrow: 0,
  lineHeight: 1.2,
  minHeight: 32,
})

const colorAnimationName = keyframes({
  from: {
    opacity: 0,
    transform: 'translate3d(0, 100%, 0)',
  },
  to: {
    opacity: 1,
    transform: 'none',
  },
})

export const toasterWrapper = style({
  animationName: colorAnimationName,
  animationDuration: '500ms',
  animationFillMode: 'both',
  borderRadius: 100,
  boxSizing: 'border-box',
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '3px',
})
