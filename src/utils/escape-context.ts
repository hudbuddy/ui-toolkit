const escapeListeners: Array<(e?: KeyboardEvent) => void> = []

/**
 * Use this to add a listener onto the "escape context" stack.
 * Once a listener is called, it removed from the stack.
 *
 * example:
 *
 * React.useEffect(() =>
 *  subscribeToEscape(listener)
 * , [])
 */
export const subscribeToEscape = (listener: (e?: KeyboardEvent) => void) => {
  escapeListeners.unshift(listener)
  return () => {
    escapeListeners.shift()
  }
}

document.body.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    escapeListeners.length && escapeListeners[0](e)
  }
})
