import React, {
  Ref,
  RefObject,
  forwardRef,
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from 'react'
import ReactDOM from 'react-dom'
import useResizeObserver from '../hooks/useResizeObserver'
import useEventListener from '../hooks/useEventListener'
import useTimeout from '../hooks/useTimeout'
import Tooltip, { TooltipProps } from './Tooltip'
import { TextProps } from '../text/Text'
import { registerComponent } from '../registry'

const TRANSITION_TIMING = 'cubic-bezier(0.215, 0.61, 0.355, 1)'

type Props = {
  children: React.ReactNode
  componentType?: ComponentType
  offsetX?: number
  offsetY?: number
  width?: number
  height?: number
  className?: string
  delay?: Milliseconds
  openDuration?: Milliseconds
  closeDuration?: Milliseconds
  scaleFrom?: number
  willClose?: boolean
  preserve?: boolean
  fillContainer?: boolean
  margin?: number
  preventClickthrough?: boolean
  transitionMovement?: boolean
  fadeDirection?: Direction
  fadeDistance?: number
  zIndex?: number
  onPhaseChange?: (phase: 'beforeOpen' | 'afterOpen' | 'beforeClose') => void
  onOutsideClick?: (target: HTMLElement) => void
}

export type FloatingMenuProps = Props & {
  top: number | string
  left: number | string
  container?: HTMLElement
}

type Direction = 'left' | 'right' | 'up' | 'down'
type ComponentType = 'Tooltip' | 'Dropdown' | 'Modal' | 'Toast'
type Milliseconds = number

/**
 * Handle creation of DOM which will contain the floating menus:
 * This defines the behavior of the single top-level container
 * as well as the containers it holds (one for each ComponentType)
 */

// Hierarchy within 'FloatingContainer':
const MENU_Z_INDEX = {
  Dropdown: 1,
  Tooltip: 2,
  Modal: 3,
  Toast: 4,
}

type ContainerId =
  | ComponentType
  | 'FloatingContainer'
  | 'FloatingContainerNotIndexed'

// Instantiate the DOM and append it to a parent
const createFloatingElement = (
  id: ComponentType,
  zIndex?: number,
): HTMLDivElement => {
  const parent = document.body
  const el = document.createElement('div')
  el.style.zIndex = String(zIndex || MENU_Z_INDEX[id])
  parent.appendChild(el)
  return el
}

// Get the container based on the type of the FloatingMenu.
//  This is where the menu will be injected.
const ensureMenuContainer = (
  id: ContainerId = 'FloatingContainer',
): HTMLElement => {
  const current = document.getElementById(id)
  if (current) {
    return current
  } else {
    const el = document.createElement('div')
    el.id = id
    document.body.appendChild(el)
    return el
  }
}

// Set the CSS transition style of the element
//  'transition-duration', 'transition-property', etc.
const setTransition = (el: HTMLElement, name: string, val: string | number) => {
  ;(el.style as any)[`transition-${name}`] = val
}

const setMargin = (el: HTMLElement, distance: number, direction: Direction) => {
  switch (direction) {
    case 'right':
      return (el.style.marginLeft = -distance + 'px')
    case 'left':
      return (el.style.marginLeft = distance + 'px')
    case 'up':
      return (el.style.marginTop = distance + 'px')
    case 'down':
      return (el.style.marginTop = -distance + 'px')
  }
}

const setOpacity = (el: HTMLElement, opacity: number) => {
  return (el.style.opacity = String(opacity))
}

const setScale = (el: HTMLElement, scale: number) => {
  return (el.style.transform = `scale(${scale}`)
}

const FloatingMenu = forwardRef(
  (
    {
      children,
      componentType = 'Modal',
      top,
      left,
      width,
      height,
      zIndex,
      container,
      scaleFrom,
      fillContainer = false,
      preserve = false,
      fadeDistance = 20,
      fadeDirection = 'down',
      className = '',
      offsetX = 0,
      offsetY = 0,
      openDuration = 0,
      closeDuration = 0,
      delay = 0,
      transitionMovement = false,
      willClose = false,
      preventClickthrough = true,
      onOutsideClick = () => {},
      onPhaseChange = () => {},
    }: FloatingMenuProps,
    ref: Ref<HTMLDivElement>,
  ) => {
    // Get HTML elements involved
    const [containerEl, setContainerEl] = useState<HTMLElement>(container)
    const [el, setEl] = useState<HTMLElement>(null)
    const [currentState, setCurrentState] = useState('initial')
    const [outsideClickDisabled, setOutsideClickDisabled] = useState(false)

    useEffect(() => {
      if (willClose) {
        setCurrentState('beforeClose')
      } else {
        if (currentState === 'beforeClose') {
          setCurrentState('beforeOpen')
        }
      }
    }, [willClose])

    useLayoutEffect(() => {
      if (!containerEl) {
        return setContainerEl(container || ensureMenuContainer())
      }

      if (!el) {
        const el = createFloatingElement(componentType, zIndex)
        el.className = `${el.className} ${className}`
        setTransition(el, 'delay', delay + 'ms')
        setMargin(el, fadeDistance, fadeDirection)
        setOpacity(el, 0)
        setEl(el)
        containerEl.appendChild(el)
        !willClose && setCurrentState('beforeOpen')
        return
      }

      if (el && container && container !== containerEl) {
        container.appendChild(el)
        return setContainerEl(container)
      }

      return () => {
        if (el && !preserve) {
          el.parentElement?.removeChild(el)
        }
      }
    }, [el, containerEl])

    useLayoutEffect(() => {
      if (!el) return
      let timeout: number

      if (currentState === 'beforeOpen') {
        onPhaseChange('beforeOpen')
        setTransition(el, 'duration', openDuration + 'ms')
        scaleFrom && setScale(el, scaleFrom)
        setMargin(el, fadeDistance, fadeDirection)
        setOpacity(el, 0)
        setTransition(el, 'property', 'margin, opacity, transform')

        if (typeof left !== 'number' || typeof top !== 'number') return

        timeout = window.setTimeout(() => {
          setCurrentState('afterOpen')
        }, delay)
      } else if (currentState === 'afterOpen') {
        onPhaseChange('afterOpen')
        setMargin(el, 0, fadeDirection)
        setOpacity(el, 1)
        scaleFrom && setScale(el, 1)
        setTransition(
          el,
          'property',
          `margin, opacity, transform
          ${transitionMovement && ', top, left'}`,
        )
      } else if (currentState === 'beforeClose') {
        onPhaseChange('beforeClose')
        setTransition(el, 'delay', 0)
        setTransition(el, 'duration', closeDuration + 'ms')

        timeout = window.setTimeout(() => {
          setOpacity(el, 0)
          scaleFrom && setScale(el, scaleFrom)
          setMargin(el, fadeDistance, fadeDirection)
        }, 0)
      }

      return () => {
        if (timeout) clearTimeout(timeout)
      }
    }, [currentState, el, left, top])

    const pointerEvents = willClose || !preventClickthrough ? 'none' : 'all'

    useLayoutEffect(() => {
      if (!el) return
      const _width = width ? `${width}px` : 'auto'
      const _height = height ? `${height}px` : 'auto'
      Object.assign(el.style, {
        position: fillContainer ? 'absolute' : 'fixed',
        top: fillContainer ? 0 : typeof top === 'number' ? `${top}px` : top,
        left: fillContainer ? 0 : typeof left === 'number' ? `${left}px` : left,
        transitionTimingFunction: TRANSITION_TIMING,
        pointerEvents: 'none',
        width: fillContainer ? '100%' : _width,
        height: fillContainer ? '100%' : _height,
      })
      if (top && left) {
        setCurrentState('afterOpen')
      }
    }, [top, left, width, height, willClose, el])

    // When determining outside clicks, ignore mouse clicks
    //  that originate inside the container
    useEventListener(
      document.body,
      'mousedown',
      (e) => {
        const target = e.target as HTMLElement
        if (el && el.contains(target)) {
          setOutsideClickDisabled(true)
        }
      },
      {},
      [Boolean(onOutsideClick)],
    )
    useEventListener(
      document.body,
      'mouseup',
      (e) => {
        window.setTimeout(() => {
          setOutsideClickDisabled(false)
        })
      },
      {},
      [Boolean(onOutsideClick)],
    )

    // Indicate to the parent that a click has occurred outside the content area
    useEventListener(
      document.body,
      'click',
      (e) => {
        if (outsideClickDisabled) return
        window.setTimeout(() => {
          const target = e.target as HTMLElement
          const isMounted =
            Boolean(target.parentElement) && document.body.contains(target)
          if (el && !el.contains(target) && isMounted) {
            onOutsideClick(target)
          }
        })
      },
      {},
      [Boolean(onOutsideClick)],
    )

    if (!el) return null

    // Positional wrapper with child to wrap content
    return ReactDOM.createPortal(
      <div
        style={{
          ...(fillContainer && {
            width: '100%',
            height: '100%',
          }),
          position: 'relative',
          top: offsetY,
          left: offsetX,
          // Note: Don't try to set CSS `transform`. Nested FloatingMenu's will not behave.
        }}
        ref={ref}
      >
        <div
          style={{
            ...(fillContainer && {
              width: '100%',
              height: '100%',
            }),
            pointerEvents,
          }}
        >
          {children}
        </div>
      </div>,
      el,
    )
  },
)

type Position = 'left' | 'right' | 'top' | 'bottom'
type TargetedFloatingMenuProps = Props & {
  targetRef: RefObject<HTMLElement>
  position: Position
  align?: 'start' | 'center' | 'end'
}
const TargetedFloatingMenu = (props: TargetedFloatingMenuProps) => {
  const {
    targetRef,
    children,
    position,
    margin = 0,
    offsetX = 0,
    offsetY = 0,
    align = 'start',
  } = props

  const [top, setTop] = useState(null)
  const [left, setLeft] = useState(null)
  const [sumOffsetX, setOffsetX] = useState(0)
  const [sumOffsetY, setOffsetY] = useState(0)
  const [menu, setMenu] = useState(null)

  const menuRef = useCallback(setMenu, [])

  // Count the trigger element as a bounded click
  const onOutsideClick = (target: HTMLElement) => {
    if (
      props.onOutsideClick &&
      targetRef.current &&
      !targetRef.current.contains(target)
    ) {
      props.onOutsideClick(target)
    }
  }

  useResizeObserver(
    [targetRef.current, menu, document.body],
    ([targetRect, menuRect]) => {
      const heightCenterOffset =
        position === 'right' || position === 'left'
          ? ((menuRect.height - targetRect.height) /
              (align === 'center' ? 2 : 1)) *
            (align === 'start' ? 0 : 1)
          : 0
      setOffsetY(-heightCenterOffset + offsetY)
      const widthCenterOffset =
        position === 'top' || position === 'bottom'
          ? ((menuRect.width - targetRect.width) /
              (align === 'center' ? 2 : 1)) *
            (align === 'start' ? 0 : 1)
          : 0
      setOffsetX(-widthCenterOffset + offsetX)

      if (position === 'left') {
        setLeft(targetRect.left - menuRect.width - margin)
        setTop(targetRect.top)
      } else if (position === 'right') {
        setLeft(targetRect.left + targetRect.width + margin)
        setTop(targetRect.top)
      } else if (position === 'top') {
        setTop(targetRect.top - menuRect.height - margin)
        setLeft(targetRect.left)
      } else if (position === 'bottom') {
        setTop(targetRect.top + targetRect.height + margin)
        setLeft(targetRect.left)
      }
    },
  )

  return (
    <FloatingMenu
      {...props}
      container={props.zIndex ? null : targetRef.current}
      top={top}
      left={left}
      offsetX={sumOffsetX}
      offsetY={sumOffsetY}
      fadeDirection={props.fadeDirection || positionDirectionMap[position]}
      onOutsideClick={onOutsideClick}
      ref={menuRef}
    >
      {children}
    </FloatingMenu>
  )
}

type PositionDirectionMap = { [position in Position]: Direction }
const positionDirectionMap: PositionDirectionMap = {
  left: 'right',
  right: 'left',
  top: 'down',
  bottom: 'up',
}

type interactions = 'onMouseEnter' | 'onMouseLeave' | 'onClick'
export type WithMenuProps = Props & {
  isOpen: boolean
  node: React.ReactNode // The component to receive a menu
  position: Position
  container?: HTMLElement
  disabled?: boolean
  align?: 'start' | 'center' | 'end'
  containerWidth?: number | string
  containerHeight?: number | string
  marginLeft?: number
  marginTop?: number
  interactionHandlers?: { [type in interactions]?: (e: any) => void }
}

// Accepts a {node, children} where the `node` is the element that will be
//  wrapped in a targeted menu. This component deals with the overhead of
//  lifecycle logic and simplifies it to `isOpen`.
//  This element does not make any assumptions about how or when it will be triggered.
const WithMenu = (props: WithMenuProps) => {
  const {
    children,
    node,
    isOpen,
    align = 'start',
    preserve = false,
    disabled = false,
    interactionHandlers = {},
    preventClickthrough = true,
    containerWidth = 'auto',
    containerHeight = 'auto',
    marginLeft,
    marginTop,
    margin = 10,
    offsetX = 0,
    offsetY = 0,
    openDuration = 200,
    closeDuration = 200,
    delay = 0,
    fadeDistance = 20,
  } = props
  const [show, setShow] = useState(isOpen)
  const targetRef = useRef()

  useTimeout(
    () => {
      setShow(false)
    },
    closeDuration,
    [!isOpen],
  )

  useEffect(() => {
    if (isOpen) {
      setShow(true)
    }
  }, [isOpen])

  return (
    <>
      <div
        style={{
          width: containerWidth,
          height: containerHeight,
          marginLeft,
          marginTop,
          pointerEvents: disabled ? 'none' : 'all',
        }}
        ref={targetRef}
        {...interactionHandlers}
      >
        {node}
      </div>
      {(isOpen || show || preserve) && (
        <TargetedFloatingMenu
          {...props}
          willClose={!isOpen}
          preventClickthrough={preventClickthrough}
          align={align}
          margin={margin}
          offsetX={offsetX}
          offsetY={offsetY}
          openDuration={openDuration}
          closeDuration={closeDuration}
          delay={delay}
          fadeDistance={fadeDistance}
          targetRef={targetRef}
        >
          {children}
        </TargetedFloatingMenu>
      )}
    </>
  )
}

type Trigger = 'hover' | 'click'
type WithTooltipProps = {
  marginLeft?: number
  marginTop?: number
  node: React.ReactNode
  delay?: number
  trigger?: Trigger
  container?: HTMLElement
  zIndex?: number
  disabled?: boolean
  textColor?: TextProps['color']
  textColorWeight?: TextProps['colorWeight']
  showCaret?: boolean
  borderColor?: TextProps['color']
  borderColorWeight?: TextProps['colorWeight']
  backgroundColor?: TextProps['color']
  backgroundColorWeight?: TextProps['colorWeight']
  /** How long the tooltip lingers after mouse leave. Useful if the tooltip has something clickable on it. */
  lingerMS?: number
  padding?: string
  nudgeX?: number
  nudgeY?: number
} & Partial<TooltipProps>

/**
 * Wrap a node in colored tooltip functionality
 */
const WithInfo = ({
  node,
  message,
  delay,
  zIndex,
  marginLeft,
  marginTop,
  disabled = false,
  height = 'auto',
  width = 200,
  offset = 0,
  nudgeX = 0,
  nudgeY = 0,
  position = 'top',
  trigger = 'hover',
  lingerMS = 1,
  padding,
  textColor,
  textColorWeight,
  borderColor,
  borderColorWeight,
  backgroundColor,
  backgroundColorWeight,
  showCaret = true,
}: WithTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [wasClosed, setWasClosed] = useState(false)
  const tooltipRef = useRef(null)

  let handlers = {}

  let mouseLeaveTimeout: number

  useEffect(() => {
    if (!wasClosed) return
    window.setTimeout(() => setWasClosed(false), 500)
  }, [wasClosed])

  /**
   * Return if the mouse is on the tooltip.
   * @returns {boolean} true - mouse is on the tooltip
   */
  const mouseOnToolTip = (): boolean => {
    if (isOpen && tooltipRef.current) {
      /* old IE or Firefox work around */
      if (!tooltipRef?.current?.matches) {
        /* old IE work around */
        if (tooltipRef?.current?.msMatchesSelector) {
          tooltipRef.current.matches = tooltipRef?.current?.msMatchesSelector
        } else {
          /* old Firefox work around */
          tooltipRef.current.matches = tooltipRef?.current?.mozMatchesSelector
        }
      }
      return tooltipRef?.current?.matches(':hover')
    }
    return false
  }

  const hideToolTip = (forceClose = false) => {
    const resetState = () => {
      // Check if the mouse is actually over the tooltip, if so don't hide the tooltip
      if (mouseOnToolTip()) {
        listenForTooltipExit()
        return
      }
      removeListenerForTooltipExit()
      setIsOpen(false)
    }
    clearTimeout(mouseLeaveTimeout)
    mouseLeaveTimeout = null
    if (lingerMS && !forceClose) {
      mouseLeaveTimeout = window.setTimeout(resetState, lingerMS)
    } else {
      resetState()
    }
  }

  // Force close on mouse leave to prevent lingering after user is done interacting
  const onMouseLeave = useCallback(() => hideToolTip(true), [])

  /*
   * If we're mousing over the tooltip remove it when we leave.
   */
  const listenForTooltipExit = () => {
    if (isOpen && tooltipRef.current) {
      tooltipRef.current.addEventListener('mouseleave', onMouseLeave)
    }
  }

  const removeListenerForTooltipExit = () => {
    if (isOpen && tooltipRef.current) {
      tooltipRef.current.removeEventListener('mouseleave', onMouseLeave)
    }
  }

  if (trigger === 'hover') {
    handlers = {
      onMouseEnter: () => {
        if (lingerMS && mouseLeaveTimeout !== null) {
          clearTimeout(mouseLeaveTimeout)
          mouseLeaveTimeout = null
        }
        setIsOpen(true)
      },
      onMouseLeave: () => {
        hideToolTip()
      },
      onClick: () => {
        setWasClosed(true)
      },
    }
  }

  if (trigger === 'click') {
    handlers = {
      onClick: isOpen
        ? () => {}
        : () => {
            setIsOpen(!isOpen)
          },
    }
  }

  useEventListener(document.body, 'click', (e) => {
    if (!isOpen) return
    window.setTimeout(() => {
      if (lingerMS && mouseLeaveTimeout !== null) {
        clearTimeout(mouseLeaveTimeout)
        mouseLeaveTimeout = null
      }
      setIsOpen(false)
    })
  })

  const isAxisX = position === 'left' || position === 'right'

  const settings = {
    node,
    position,
    delay:
      typeof delay === 'number'
        ? delay
        : trigger === 'hover'
        ? isOpen
          ? 500
          : 0
        : 0,
    offsetX: isAxisX ? 0 : offset,
    offsetY: isAxisX ? offset : 0,
  }

  if (!message) return <>{node}</>

  return (
    <WithMenu
      {...MENU_DEFAULT_SETTINGS.Tooltip}
      {...settings}
      {...(wasClosed && { closeDuration: 0 })}
      align="center"
      componentType="Tooltip"
      interactionHandlers={handlers}
      isOpen={isOpen && !wasClosed}
      node={node}
      zIndex={zIndex}
      disabled={disabled}
      marginLeft={marginLeft}
      marginTop={marginTop}
      offsetX={nudgeX}
      offsetY={nudgeY}
    >
      <Tooltip
        textColor={textColor}
        textColorWeight={textColorWeight}
        toolTipRef={tooltipRef}
        message={message}
        height={height}
        width={width}
        offset={-offset}
        padding={padding}
        position={position}
        showCaret={showCaret}
        borderColor={borderColor}
        backgroundColor={backgroundColor}
        backgroundColorWeight={backgroundColorWeight}
        borderColorWeight={borderColorWeight}
      />
    </WithMenu>
  )
}

const isFloatingElement = (el: HTMLElement) => {
  const containers = [
    document.querySelector('#FloatingContainer'),
    document.querySelector('#FloatingContainerNotIndexed'),
  ].filter(Boolean)
  return Boolean(containers.find((x) => x.contains(el)))
}

type WithDropdownProps = Omit<WithMenuProps, 'position'> & {
  onClose: () => void
  onClick?: (e: any) => void
  position?: WithMenuProps['position']
}

/**
 * Wrap a node in dropdown functionality
 */
const WithDropdown = (props: WithDropdownProps) => {
  const {
    children,
    className,
    onClick,
    onClose,
    isOpen = false,
    position = 'bottom',
    disabled = false,
  } = props

  const onOutsideClick = () => {
    onClose()
  }

  // Indicate to the parent that the dropdown believes it should close
  useEventListener(
    document.body,
    'keydown',
    (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    {},
    [isOpen],
  )

  return (
    <WithMenu
      componentType="Dropdown"
      {...MENU_DEFAULT_SETTINGS.Dropdown}
      {...props}
      position={position}
      disabled={disabled}
      interactionHandlers={{ onClick }}
      onOutsideClick={onOutsideClick}
      className={className}
      isOpen={isOpen}
    >
      {children}
    </WithMenu>
  )
}

type ModalProps = Props & {
  onClose: () => void
  isOpen: boolean
  top?: number | string
  left?: number | string
}

/**
 * Wrap a node in modal functionality
 */
const Modal = ({
  children,
  isOpen,
  top = '30%',
  left = '50%',
  closeDuration = MENU_DEFAULT_SETTINGS.Modal.closeDuration,
  onClose,
  ...props
}: ModalProps) => {
  const [show, setShow] = useState(isOpen)
  const [menu, setMenu] = useState(null)
  const [offsetX, setOffsetX] = useState(0)

  const menuRef = useCallback(setMenu, [])

  // Indicate to the parent that the modal believes it should close
  // useEventListener(
  //   document.body,
  //   'keydown',
  //   (e) => {
  //     if (e.key === 'Escape') {
  //       onClose()
  //     }
  //   },
  //   {},
  //   [isOpen],
  // )

  useResizeObserver([menu], ([menuRect]) => {
    setOffsetX(-menuRect.width / 2)
  })

  return (
    (isOpen || show) && (
      <FloatingMenu
        componentType="Modal"
        top={top}
        left={left}
        {...MENU_DEFAULT_SETTINGS.Modal}
        {...props}
        willClose={!isOpen}
        offsetX={offsetX}
        ref={menuRef}
      >
        {children}
      </FloatingMenu>
    )
  )
}

type MenuPresets = {
  position?: WithMenuProps['position']
  openDuration: Props['openDuration']
  closeDuration: Props['closeDuration']
  preventClickthrough?: Props['preventClickthrough']
  margin: Props['margin']
  fadeDistance?: FloatingMenuProps['fadeDistance']
}
type MenuPresetsMap = { [type in ComponentType]?: MenuPresets }
const MENU_DEFAULT_SETTINGS: MenuPresetsMap = {
  Tooltip: {
    preventClickthrough: false,
    position: 'right',
    openDuration: 100,
    closeDuration: 80,
    margin: 14,
    fadeDistance: 6,
  },
  Dropdown: {
    preventClickthrough: true,
    position: 'bottom',
    openDuration: 160,
    closeDuration: 120,
    margin: 6,
    fadeDistance: 5,
  },
  Modal: {
    preventClickthrough: true,
    openDuration: 200,
    closeDuration: 200,
    margin: 0,
    fadeDistance: 10,
  },
}

export { Modal, TargetedFloatingMenu, WithMenu, WithDropdown, WithInfo }

export default FloatingMenu

registerComponent('WithInfo', WithInfo)
