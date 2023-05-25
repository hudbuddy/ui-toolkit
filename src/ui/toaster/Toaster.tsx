import { createPortal } from 'react-dom'
import React from 'react'
import { getContainerPosition, toasterContainer } from './ToasterStyle'
import { Box } from '../Layout'
import Toast from './Toast'
import type { ToastConfig } from './Toast'
import classNames from 'classnames'

export type Placement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'

type Placements = Partial<Record<Placement, ToastOpenConfig[]>>

export interface ToasterProps {
  prefixCls?: string
  container?: HTMLElement
  maxCount?: number
  className?: (placement: Placement) => string
  style?: (placement: Placement) => React.CSSProperties
  onAllRemoved?: VoidFunction
}

export interface ToastOpenConfig extends ToastConfig {
  key: React.Key
  placement?: Placement
  content?: React.ReactNode
  duration?: number | null
}

export interface ToastersRef {
  open: (config: ToastOpenConfig) => void
  close: (key: React.Key) => void
  destroy: () => void
}

const Toasters = React.forwardRef<ToastersRef, ToasterProps>((props, ref) => {
  const {
    prefixCls = 'lightstream-toaster',
    className = () => '',
    container,
    maxCount,
    style,
    onAllRemoved,
  } = props
  const [configList, setConfigList] = React.useState<ToastOpenConfig[]>([])

  // ======================== Close =========================
  const onToastClose = (key: React.Key) => {
    // Trigger close event
    const config = configList.find(
      (item) => item.key === key,
    ) as ToastOpenConfig
    config?.onClose?.()

    setConfigList((list) => list.filter((item) => item.key !== key))
  }

  // ========================= Refs =========================
  React.useImperativeHandle(ref, () => ({
    open: (config) => {
      setConfigList((list) => {
        let clone = [...list]

        // Replace if exist
        const index = clone.findIndex((item) => item.key === config.key)
        if (index >= 0) {
          clone[index] = config
        } else {
          clone.push(config)
        }

        if (maxCount > 0 && clone.length > maxCount) {
          clone = clone.slice(-maxCount)
        }

        return clone
      })
    },
    close: (key) => {
      onToastClose(key)
    },
    destroy: () => {
      setConfigList([])
    },
  }))

  // ====================== Placements ======================
  const [placements, setPlacements] = React.useState<Placements>({})

  React.useEffect(() => {
    const nextPlacements: Placements = {}

    configList.forEach((config) => {
      const { placement = 'top' } = config

      if (placement) {
        nextPlacements[placement] = nextPlacements[placement] || []
        nextPlacements[placement].push(config)
      }
    })

    // Fill exist placements to avoid empty list causing remove without motion
    Object.keys(placements).forEach((placement: Placement) => {
      nextPlacements[placement] = nextPlacements[placement] || []
    })

    setPlacements(nextPlacements)
  }, [configList])

  // Clean up container if all toasts fade out
  const onAllToastRemoved = (placement: Placement) => {
    setPlacements((originPlacements) => {
      const clone = {
        ...originPlacements,
      }
      const list = clone[placement] || []

      if (!list.length) {
        delete clone[placement]
      }

      return clone
    })
  }

  // Effect tell that placements is empty now
  const emptyRef = React.useRef(false)
  const nodeRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (Object.keys(placements).length > 0) {
      emptyRef.current = true
    } else if (emptyRef.current) {
      // Trigger only when from exist to empty
      onAllRemoved?.()
      emptyRef.current = false
    }
  }, [placements])

  // ======================== Render ========================
  if (!container) {
    return null
  }

  const placementList = Object.keys(placements) as Placement[]

  return createPortal(
    <>
      {placementList.map((placement) => {
        const placementConfigList = placements[placement]
        const keys = placementConfigList.map((config: ToastOpenConfig) => ({
          config,
          key: config.key,
        }))

        return (
          <Box
            style={getContainerPosition(placement)}
            className={classNames(toasterContainer, className(placement))}
            key={placement}
          >
            {keys.map((key) => {
              const { config } = key
              const { className: configClassName, style: configStyle } = config
              return (
                <Toast
                  {...config}
                  ref={nodeRef}
                  prefixCls={prefixCls}
                  key={key.key}
                  eventKey={key.key}
                  {...(configStyle
                    ? {
                        style: {
                          ...configStyle,
                        },
                      }
                    : {})}
                  onToastClose={onToastClose}
                />
              )
            })}
          </Box>
        )
      })}
    </>,
    container,
  )
})

if (process.env.NODE_ENV !== 'production') {
  Toasters.displayName = 'Toasters'
}

export default Toasters
