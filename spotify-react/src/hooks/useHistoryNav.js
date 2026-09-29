import { useEffect, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router'

/** Whether the back / forward arrows in the top bar have somewhere to go. */
export function useHistoryNav() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const index = window.history.state?.idx ?? 0
  const [maxIndex, setMaxIndex] = useState(index)

  useEffect(() => {
    // A new navigation (PUSH) drops the forward history; going back/forward (POP) keeps it.
    setMaxIndex((max) => (navigationType === 'PUSH' ? index : Math.max(max, index)))
  }, [location.key, navigationType, index])

  return { canGoBack: index > 0, canGoForward: index < maxIndex }
}
