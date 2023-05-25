import { useState, useCallback, Ref } from 'react'

export const useElementFromRef = function <T>(): [Ref<T>, T] {
  const [el, setEl] = useState<T>()

  const ref = useCallback((node: T) => {
    if (node) {
      setEl(node)
    }
  }, [])

  return [ref, el]
}

export default useElementFromRef
