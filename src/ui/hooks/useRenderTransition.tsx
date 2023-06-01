import { useLayoutEffect, useState } from 'react'
import useEffectOnce from './useEffectOnce'
import useElementFromRef from './useElementFromRef'

/**
 * Assign a ref to an element to run a transition on render.
 * The element must be assigned an opacity of 0:
 *
 * <div {...renderTransition} />
 */
export const useRenderTransition = <T extends HTMLElement = HTMLElement>(
  start: Partial<React.CSSProperties> = {},
  end: Partial<React.CSSProperties> = {},
  duration = 300,
) => {
  const [ref, el] = useElementFromRef<T>()
  const [rendered, setRendered] = useState(false)
  const style = {
    opacity: 0,
    ...start,
    transitionProperty: Object.keys(start).join(', ') + ', opacity',
    transitionDuration: duration + 'ms',
  } as React.CSSProperties

  useEffectOnce(
    () => {
      window.setTimeout(() => {
        Object.assign(el.style, {
          opacity: 1,
          ...end,
        })
      })
    },
    [el, rendered],
    ([el]) => Boolean(el),
  )

  useLayoutEffect(() => {
    setRendered(true)
  }, [])

  return { ref, style }
}

export default useRenderTransition
