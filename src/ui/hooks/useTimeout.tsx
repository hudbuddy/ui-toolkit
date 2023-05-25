import { useEffect, DependencyList } from 'react'

const hasInvalidDep = (deps: DependencyList) => deps.some((x) => !Boolean(x))

export const useTimeout = (
  cb: () => void,
  delay = 0,
  deps: DependencyList = [],
) => {
  useEffect(() => {
    if (hasInvalidDep(deps)) return

    const timeout = setTimeout(() => {
      if (hasInvalidDep(deps)) return
      cb()
    }, delay)

    return () => {
      clearTimeout(timeout)
    }
  }, deps)
}

export default useTimeout
