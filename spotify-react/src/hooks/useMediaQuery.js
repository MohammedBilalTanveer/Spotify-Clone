import { useCallback, useSyncExternalStore } from 'react'

/** Shell breakpoints - keep in sync with the @media rules in styles/layout.css. */
export const DRAWER_QUERY = '(max-width: 1023px)' // sidebar becomes a slide-in drawer
export const MOBILE_QUERY = '(max-width: 639px)' // phone layout: mini player + bottom nav

export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}
