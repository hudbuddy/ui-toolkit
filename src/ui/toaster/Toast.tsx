import * as React from 'react'
import classNames from 'classnames'
import { Box } from '../Layout'
import { Icon, IconName } from '../icons/Icon'
import { Body, TextProps } from '../text/Text'
import * as Colors from '../colors'
import { toasterWrapper, toasterContent } from './ToasterStyle'

interface styleProps {
  backgroundColor?: TextProps['color']
  backgroundColorWeight?: TextProps['colorWeight']
  textColor?: TextProps['color']
  textColorWeight?: TextProps['colorWeight']
  fontSize?: TextProps['fontSize']
  fontWeight?: TextProps['fontWeight']
}
export interface ToastConfig {
  content?: React.ReactNode
  duration?: number | null
  closeIcon?: IconName
  icon?: IconName
  closable?: boolean
  className?: string
  style?: styleProps
  /** @private Internal usage. Do not override in your code */
  props?: React.HTMLAttributes<HTMLDivElement> & Record<string, any>

  onClose?: VoidFunction
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

export interface ToastProps extends Omit<ToastConfig, 'onClose'> {
  prefixCls: string
  className?: string
  style?: styleProps
  eventKey: React.Key
  onClick?: React.MouseEventHandler<HTMLDivElement>
  onToastClose?: (key: React.Key) => void
}

const Notify = React.forwardRef<HTMLDivElement, ToastProps>((props, ref) => {
  const {
    prefixCls,
    style = {
      backgroundColor: 'primary',
      backgroundColorWeight: 500,
      fontSize: 14,
      fontWeight: 700,
    },
    duration = 4.5,
    eventKey,
    content,
    closable,
    closeIcon = 'Close',
    icon,
    props: divProps,

    onClick,
    onToastClose,
  } = props
  const [hovering, setHovering] = React.useState(false)

  // ======================== Close =========================
  const onInternalClose = () => {
    onToastClose(eventKey)
  }

  // ======================== Effect ========================
  React.useEffect(() => {
    if (!hovering && duration > 0) {
      const timeout = setTimeout(() => {
        onInternalClose()
      }, duration * 1000)

      return () => {
        clearTimeout(timeout)
      }
    }
  }, [duration, hovering])

  // ======================== Render ========================
  const toastPrefixCls = `${prefixCls}`

  const toasterBackground = {
    backgroundColor: Colors[style.backgroundColor](style.backgroundColorWeight),
  }

  const toasterBorder = {
    border: `1px solid ${Colors[style.backgroundColor](
      style.backgroundColorWeight,
    )}`,
  }

  return (
    <div
      {...divProps}
      ref={ref}
      className={classNames(toastPrefixCls, toasterWrapper, {
        [`${toastPrefixCls}-closable`]: closable,
      })}
      style={toasterBorder}
      onMouseEnter={() => {
        setHovering(true)
      }}
      onMouseLeave={() => {
        setHovering(false)
      }}
      onClick={onClick}
    >
      <Box className={toasterContent} style={toasterBackground}>
        {/* Front Icon */}
        {icon && (
          <Box className={`${toastPrefixCls}-icon`}>
            <Icon name={icon} height={24} width={24} />
          </Box>
        )}
        {/* Content */}
        {typeof content === 'string' ? (
          <>
            <Box
              marginLeft={4}
              marginRight={4}
              className={`${toastPrefixCls}-content`}
            >
              <Body
                color={style.textColor}
                colorWeight={style.textColorWeight}
                text={content}
                fontSize={style.fontSize}
                fontWeight={style.fontWeight}
              />
            </Box>
          </>
        ) : (
          <Box
            marginLeft={4}
            marginRight={4}
            className={`${toastPrefixCls}-content`}
          >
            {content}
          </Box>
        )}

        {/* Close Icon */}
        {closable && (
          <a
            style={{ marginLeft: 4 }}
            tabIndex={0}
            className={`${toastPrefixCls}-close`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onInternalClose()
            }}
          >
            <Icon name={closeIcon} height={20} width={20} />
          </a>
        )}
      </Box>
    </div>
  )
})

export default Notify
