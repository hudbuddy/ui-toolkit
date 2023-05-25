import React, { useEffect, useRef } from 'react'

/**
 * Enables an effect that only runs once even
 *  if it has a dependency array.
 */
export const useEffectOnce = <T extends React.DependencyList>(
  callback: (dependencies: T) => void,
  dependencies: T,
  /** Run the effect when this condition is met */
  condition?: (dependencies: T) => boolean,
) => {
  const calledOnce = useRef(false)

  useEffect(() => {
    if (calledOnce.current) return

    if (!condition || condition(dependencies)) {
      callback(dependencies)

      calledOnce.current = true
    }
  }, [callback, condition, dependencies])
}

export default useEffectOnce
