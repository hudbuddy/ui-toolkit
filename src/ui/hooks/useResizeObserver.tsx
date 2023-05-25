import { useLayoutEffect, DependencyList, useMemo } from 'react'

type ObserverCallback = (entries: DOMRectReadOnly[]) => void

const getRect = (x: HTMLElement) => x.getBoundingClientRect() as DOMRectReadOnly
document.body.addEventListener(
  'scroll',
  () => {
    scrollListeners.forEach((x) => x())
  },
  true,
)

const scrollListeners = new Set<() => void>()

export const useResizeObserver = (
  els: HTMLElement[],
  callback: ObserverCallback,
  triggers: DependencyList = [],
) => {
  const cb = useMemo(
    () => () => callback(els.filter(Boolean).map(getRect)),
    [...els],
  )

  useLayoutEffect(() => {
    const invalidRef = els.some((x) => !x)
    if (invalidRef) return

    scrollListeners.add(cb)

    const resizeObserver = new (window as any).ResizeObserver(cb)
    els.forEach((el) => resizeObserver.observe(el))

    return () => {
      resizeObserver.disconnect()
      scrollListeners.delete(cb)
    }
  }, [...els, ...triggers])
}

export default useResizeObserver
