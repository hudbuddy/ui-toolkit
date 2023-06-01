import { useLayoutEffect, useEffect, useRef } from 'react'

type HandlerMap = GlobalEventHandlersEventMap & MediaDevicesEventMap

export const useEventListener = <K extends keyof HandlerMap>(
  eventTarget: EventTarget,
  eventType: K,
  handler: (e: HandlerMap[K]) => void,
  options: AddEventListenerOptions = {},
  conditions: boolean[] = [],
): void => {
  type Handler = typeof handler

  // Create a ref that stores handler
  const savedHandler = useRef<Handler>()

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useLayoutEffect(() => {
    // Return early if a condition is not met
    if (conditions.includes(false) || !eventTarget) return

    // Create event listener that calls handler function stored in ref
    const eventListener: Handler = (event) => {
      if (savedHandler.current) {
        savedHandler.current(event)
      }
    }

    // Add event listener
    eventTarget.addEventListener(
      eventType,
      eventListener as EventListener,
      options,
    )

    // Remove event listener on cleanup
    return () => {
      eventTarget.removeEventListener(eventType, eventListener as EventListener)
    }
  }, [eventTarget, ...conditions]) // Re-run if eventName or element changes
}

export default useEventListener
