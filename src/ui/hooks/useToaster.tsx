import * as React from 'react'
import Toasters from '../toaster/Toaster'
import type { Placement } from '../toaster/Toaster'
import type { ToastersRef, ToastOpenConfig } from '../toaster/Toaster'

const defaultGetContainer = () => document.body

type OptionalConfig = Partial<ToastOpenConfig>

export interface ToasterConfig {
  prefixCls?: string
  /** Customize container. It will repeat call which means you should return same container element. */
  getContainer?: () => HTMLElement
  closable?: boolean
  maxCount?: number
  duration?: number
  /** @private. Config for toaster holder style. Safe to remove if refactor */
  className?: (placement: Placement) => string
  /** @private. Config for toaster holder style. Safe to remove if refactor */
  style?: (placement: Placement) => React.CSSProperties
  /** @private Trigger when all the toaster closed. */
  onAllRemoved?: VoidFunction
}

export interface ToasterAPI {
  open: (config: OptionalConfig) => void
  close: (key: React.Key) => void
  destroy: () => void
}

interface OpenTask {
  type: 'open'
  config: ToastOpenConfig
}

interface CloseTask {
  type: 'close'
  key: React.Key
}

interface DestroyTask {
  type: 'destroy'
}

type Task = OpenTask | CloseTask | DestroyTask

let uniqueKey = 0

type tplotOptions = {
  [key: React.Key]: React.Key
  key: React.Key
}

function mergeConfig<T>(...objList: Partial<T>[]): tplotOptions {
  const clone: tplotOptions = {} as tplotOptions

  objList.forEach((obj: any) => {
    if (obj) {
      Object.keys(obj).forEach((key: any) => {
        const val = obj[key]

        if (val !== undefined) {
          clone[key] = val
        }
      })
    }
  })

  return clone
}

export function useToaster(
  rootConfig: ToasterConfig = {},
): [ToasterAPI, React.ReactElement] {
  const {
    getContainer = defaultGetContainer,
    // motion,
    prefixCls,
    maxCount,
    className,
    style,
    onAllRemoved,
    ...shareConfig
  } = rootConfig

  const [container, setContainer] = React.useState<HTMLElement>()
  const toastersRef = React.useRef<ToastersRef>()
  const contextHolder = (
    <Toasters
      container={container}
      ref={toastersRef}
      prefixCls={prefixCls}
      maxCount={maxCount}
      className={className}
      style={style}
      onAllRemoved={onAllRemoved}
    />
  )

  const [taskQueue, setTaskQueue] = React.useState<Task[]>([])

  // ========================= Refs =========================
  const api = React.useMemo<ToasterAPI>(() => {
    return {
      open: (config) => {
        const mergedConfig = mergeConfig(shareConfig, config)
        if (mergedConfig.key === null || mergedConfig.key === undefined) {
          mergedConfig.key = `lightstream-toaster-${uniqueKey}`
          uniqueKey += 1
        }

        setTaskQueue((queue) => [
          ...queue,
          { type: 'open', config: mergedConfig },
        ])
      },
      close: (key) => {
        setTaskQueue((queue) => [...queue, { type: 'close', key }])
      },
      destroy: () => {
        setTaskQueue((queue) => [...queue, { type: 'destroy' }])
      },
    }
  }, [])

  // ======================= Container ======================
  React.useEffect(() => {
    setContainer(getContainer())
  }, [])

  // ======================== Effect ========================
  React.useEffect(() => {
    // Flush task when node ready
    if (toastersRef.current && taskQueue.length) {
      taskQueue.forEach((task) => {
        switch (task.type) {
          case 'open':
            toastersRef.current.open(task.config)
            break

          case 'close':
            toastersRef.current.close(task.key)
            break

          case 'destroy':
            toastersRef.current.destroy()
            break
        }
      })

      setTaskQueue([])
    }
  }, [taskQueue])

  // ======================== Return ========================
  return [api, contextHolder]
}

export default useToaster
